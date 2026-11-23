"use strict";

const LocationModel = require("../models/location.models");
const CategoryModel = require("../models/category.models");
const ZoneModel = require("../models/zone.models");
const ReviewModel = require("../models/review.models");
const PhotoSpotModel = require("../models/photo-spot.models");
const AppError = require("../utils/appError");
const { buildPoint, buildSearchRegex } = require("../utils/geo");
const { assertIsOwnerOrAdmin } = require("../utils/ownership");

// Campos que se traen de las referencias al poblar
const POPULATE_CATEGORY = { path: "category", select: "name color icon allowsPhotoSpots" };
const POPULATE_AUTHOR = { path: "createdBy", select: "name" };

class LocationsService {
    /**
     * Devuelve las ubicaciones aplicando los tres filtros de la rubrica:
     * texto parcial, categoria y zona.
     */
    async getAll(filters = {}) {
        const query = await this.buildFilter(filters);

        return LocationModel
            .find(query)
            .populate(POPULATE_CATEGORY) // Para mostrar el nombre, no el ObjectId
            .populate(POPULATE_AUTHOR)
            .sort({ createdAt: -1 });
    }

    /**
     * Traduce los filtros de la URL al objeto de consulta de MongoDB.
     * Es async porque el filtro por zona necesita leer el poligono primero.
     */
    async buildFilter(filters = {}) {
        const {
            search = "",
            category = "all",
            zone = "all",
            status = "all",
            priceLevel = "all"
        } = filters;

        const query = {};

        // Filtro 1: texto parcial sobre nombre, descripcion y direccion
        const searchRegex = buildSearchRegex(search);

        if (searchRegex) {
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { address: searchRegex }
            ];
        }

        // Filtro 2: por categoria (se recibe el id de la categoria)
        if (category !== "all") {
            query.category = category;
        }

        /**
         * Filtro 3: por zona.
         * Se trae el poligono de la zona y se piden las ubicaciones cuyo punto
         * cae dentro de el. $geoWithin usa el indice 2dsphere de location,
         * asi que el filtro lo resuelve MongoDB y no Node.
         */
        if (zone !== "all") {
            const zoneDocument = await ZoneModel.findById(zone);

            if (!zoneDocument) {
                throw new AppError(404, `No se encontro la zona con el id ${zone}.`);
            }

            query.location = {
                $geoWithin: { $geometry: zoneDocument.area }
            };
        }

        if (status !== "all") {
            query.status = status;
        }

        if (priceLevel !== "all") {
            query.priceLevel = Number(priceLevel);
        }

        return query;
    }

    // Busca una ubicacion por id y lanza 404 si no existe
    async getById(id) {
        const location = await LocationModel
            .findById(id)
            .populate(POPULATE_CATEGORY)
            .populate(POPULATE_AUTHOR);

        if (!location) {
            throw new AppError(404, `No se encontro la ubicacion con el id ${id}.`);
        }

        return location;
    }

    // Devuelve las ubicaciones filtradas en formato GeoJSON para Leaflet
    async getGeoJSON(filters = {}) {
        const locations = await this.getAll(filters);

        return {
            type: "FeatureCollection",
            features: locations.map((location) => ({
                type: "Feature",
                properties: {
                    id: location.id,
                    name: location.name,
                    description: location.description,
                    // El nombre y el color de la categoria, no su ObjectId:
                    // asi el frontend pinta el marcador sin otra peticion
                    category: location.category?.name || null,
                    categoryId: location.category?._id?.toString() || null,
                    categoryColor: location.category?.color || null,
                    address: location.address,
                    priceLevel: location.priceLevel,
                    status: location.status,
                    createdBy: location.createdBy?.name || null,
                    createdAt: location.createdAt,
                    updatedAt: location.updatedAt
                },
                geometry: location.location // Ya es un Point [longitud, latitud]
            }))
        };
    }

    // Comprueba que la categoria exista antes de guardar
    async assertCategoryExists(categoryId) {
        const existe = await CategoryModel.exists({ _id: categoryId });

        if (!existe) {
            throw new AppError(400, "La categoria indicada no existe.");
        }
    }

    // Registra una ubicacion nueva
    async create(data, user) {
        await this.assertCategoryExists(data.category);

        const location = await LocationModel.create({
            name: data.name,
            description: data.description,
            category: data.category,
            createdBy: user.id, // Sale del token, nunca del cuerpo de la peticion
            address: data.address,
            priceLevel: data.priceLevel,
            status: data.status,
            location: buildPoint(data.longitude, data.latitude)
        });

        return this.getById(location.id); // Se devuelve ya poblada
    }

    // Actualiza solo los campos que vengan en el cuerpo (PATCH)
    async update(id, changes, user) {
        const location = await LocationModel.findById(id);

        if (!location) {
            throw new AppError(404, `No se encontro la ubicacion con el id ${id}.`);
        }

        // Solo quien la registro, o un administrador, puede modificarla
        assertIsOwnerOrAdmin(location, user, "createdBy");

        if (changes.category !== undefined) {
            await this.assertCategoryExists(changes.category);
            location.category = changes.category;
        }

        const campos = ["name", "description", "address", "priceLevel", "status"];

        for (const campo of campos) {
            if (changes[campo] !== undefined) {
                location[campo] = changes[campo];
            }
        }

        // Si llega una sola coordenada se conserva la otra
        if (changes.latitude !== undefined || changes.longitude !== undefined) {
            const [actualLng, actualLat] = location.location.coordinates;

            location.location = buildPoint(
                changes.longitude !== undefined ? changes.longitude : actualLng,
                changes.latitude !== undefined ? changes.latitude : actualLat
            );
        }

        await location.save();

        return this.getById(location.id);
    }

    /**
     * Elimina una ubicacion y, con ella, sus resenas y sus photo spots.
     * Aqui si se borra en cascada porque una resena o un photo spot sin
     * su ubicacion no significan nada.
     */
    async delete(id, user) {
        const location = await this.getById(id);

        // Misma regla que al editar: dueño o administrador
        assertIsOwnerOrAdmin(location, user, "createdBy");

        const [reviews, photoSpots] = await Promise.all([
            ReviewModel.deleteMany({ location: id }),
            PhotoSpotModel.deleteMany({ subject: id })
        ]);

        await LocationModel.findByIdAndDelete(id);

        return {
            location,
            removed: {
                reviews: reviews.deletedCount,
                photoSpots: photoSpots.deletedCount
            }
        };
    }

    // Resumen para las estadisticas de la vista principal
    async getStats() {
        const [total, porCategoria, porStatus] = await Promise.all([
            LocationModel.countDocuments(),
            LocationModel.aggregate([
                { $group: { _id: "$category", total: { $sum: 1 } } },
                {
                    $lookup: {
                        from: "categories", // Nombre de la coleccion en MongoDB
                        localField: "_id",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" },
                {
                    $project: {
                        _id: 0,
                        category: "$category.name",
                        color: "$category.color",
                        total: 1
                    }
                },
                { $sort: { total: -1 } }
            ]),
            LocationModel.aggregate([
                { $group: { _id: "$status", total: { $sum: 1 } } },
                { $project: { _id: 0, status: "$_id", total: 1 } }
            ])
        ]);

        return { total, byCategory: porCategoria, byStatus: porStatus };
    }
}

module.exports = LocationsService;
