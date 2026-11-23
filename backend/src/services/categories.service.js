"use strict";

const CategoryModel = require("../models/category.models");
const LocationModel = require("../models/location.models");
const AppError = require("../utils/appError");
const { buildSearchRegex } = require("../utils/geo");

class CategoriesService {
    // Devuelve todas las categorias, con filtro opcional por texto
    async getAll(filters = {}) {
        const query = this.buildFilter(filters);

        return CategoryModel
            .find(query)
            .sort({ name: 1 }); // Alfabetico: es un catalogo, no un historial
    }

    // Traduce los filtros de la URL al objeto de consulta de MongoDB
    buildFilter(filters = {}) {
        const { search = "", allowsPhotoSpots } = filters;

        const query = {};

        const searchRegex = buildSearchRegex(search);

        if (searchRegex) {
            query.$or = [
                { name: searchRegex },
                { description: searchRegex }
            ];
        }

        // Llega como texto en la URL, hay que compararlo como texto
        if (allowsPhotoSpots === "true" || allowsPhotoSpots === "false") {
            query.allowsPhotoSpots = allowsPhotoSpots === "true";
        }

        return query;
    }

    // Busca una categoria por id y lanza 404 si no existe
    async getById(id) {
        const category = await CategoryModel.findById(id);

        if (!category) {
            throw new AppError(404, `No se encontro la categoria con el id ${id}.`);
        }

        return category;
    }

    // Crea una categoria nueva
    async create(data) {
        return CategoryModel.create({
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon,
            allowsPhotoSpots: data.allowsPhotoSpots
        });
    }

    // Actualiza solo los campos que vengan en el cuerpo (PATCH)
    async update(id, changes) {
        const category = await this.getById(id);

        const campos = ["name", "description", "color", "icon", "allowsPhotoSpots"];

        for (const campo of campos) {
            if (changes[campo] !== undefined) {
                category[campo] = changes[campo];
            }
        }

        // save() vuelve a correr las validaciones del esquema
        await category.save();

        return category;
    }

    /**
     * Elimina una categoria.
     * MongoDB no tiene llaves foraneas, asi que la integridad se revisa a mano:
     * si hay ubicaciones usandola, se bloquea en lugar de dejarlas apuntando
     * a una categoria que ya no existe.
     */
    async delete(id) {
        const category = await this.getById(id);

        const enUso = await LocationModel.countDocuments({ category: id });

        if (enUso > 0) {
            throw new AppError(
                409, // 409 Conflict: la peticion choca con el estado actual
                `No se puede eliminar: hay ${enUso} ubicacion(es) con esta categoria. ` +
                "Cambiales la categoria primero."
            );
        }

        await category.deleteOne();

        return category;
    }

    // Cuantas ubicaciones tiene cada categoria (para la vista de catalogo)
    async getUsage() {
        const categories = await CategoryModel.find().sort({ name: 1 });

        const conteos = await LocationModel.aggregate([
            { $group: { _id: "$category", total: { $sum: 1 } } }
        ]);

        // Se pasa a Map para no recorrer el arreglo dentro del otro recorrido
        const porCategoria = new Map(
            conteos.map((fila) => [String(fila._id), fila.total])
        );

        return categories.map((category) => ({
            ...category.toJSON(),
            locationsCount: porCategoria.get(category.id) || 0
        }));
    }
}

module.exports = CategoriesService;
