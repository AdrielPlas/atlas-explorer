"use strict";

const mongoose = require("mongoose");

const ReviewModel = require("../models/review.models");
const LocationModel = require("../models/location.models");
const AppError = require("../utils/appError");

const POPULATE_LOCATION = { path: "location", select: "name category" };
const POPULATE_AUTHOR = { path: "author", select: "name" };

class ReviewsService {
    // Devuelve las resenas aplicando los filtros recibidos
    async getAll(filters = {}) {
        return ReviewModel
            .find(this.buildFilter(filters))
            .populate(POPULATE_LOCATION)
            .populate(POPULATE_AUTHOR)
            .sort({ createdAt: -1 });
    }

    buildFilter(filters = {}) {
        const { location = "all", author = "all", minRating = "all" } = filters;

        const query = {};

        if (location !== "all") {
            query.location = location;
        }

        if (author !== "all") {
            query.author = author;
        }

        if (minRating !== "all") {
            query.rating = { $gte: Number(minRating) };
        }

        return query;
    }

    // Busca una resena por id y lanza 404 si no existe
    async getById(id) {
        const review = await ReviewModel
            .findById(id)
            .populate(POPULATE_LOCATION)
            .populate(POPULATE_AUTHOR);

        if (!review) {
            throw new AppError(404, `No se encontro la resena con el id ${id}.`);
        }

        return review;
    }

    // Comprueba que la ubicacion exista antes de guardar
    async assertLocationExists(locationId) {
        const existe = await LocationModel.exists({ _id: locationId });

        if (!existe) {
            throw new AppError(400, "La ubicacion que quieres resenar no existe.");
        }
    }

    /**
     * Crea una resena.
     * El modelo tiene un indice unico sobre (location, author), asi que si el
     * usuario ya resenó ese lugar MongoDB rechaza el insert con el error 11000.
     * Se revisa antes para dar un mensaje claro en lugar del 409 genérico.
     */
    async create(data, user) {
        await this.assertLocationExists(data.location);

        const yaResenó = await ReviewModel.exists({
            location: data.location,
            author: user.id
        });

        if (yaResenó) {
            throw new AppError(
                409,
                "Ya resenaste esta ubicacion. Edita tu resena en lugar de crear otra."
            );
        }

        const review = await ReviewModel.create({
            rating: data.rating,
            comment: data.comment,
            location: data.location,
            author: user.id // Sale del token, nunca del cuerpo de la peticion
        });

        return this.getById(review.id);
    }

    // Actualiza solo los campos que vengan en el cuerpo (PATCH)
    async update(id, changes) {
        const review = await ReviewModel.findById(id);

        if (!review) {
            throw new AppError(404, `No se encontro la resena con el id ${id}.`);
        }

        // La ubicacion y el autor no se cambian: eso seria otra resena
        const campos = ["rating", "comment"];

        for (const campo of campos) {
            if (changes[campo] !== undefined) {
                review[campo] = changes[campo];
            }
        }

        await review.save();

        return this.getById(review.id);
    }

    // Elimina la resena
    async delete(id) {
        const review = await this.getById(id);

        await ReviewModel.findByIdAndDelete(id);

        return review;
    }

    // Las resenas de una ubicacion con su calificacion promedio
    async getByLocation(locationId) {
        const [reviews, resumen] = await Promise.all([
            ReviewModel
                .find({ location: locationId })
                .populate(POPULATE_AUTHOR)
                .sort({ createdAt: -1 }),
            ReviewModel.aggregate([
                { $match: { location: new mongoose.Types.ObjectId(locationId) } },
                {
                    $group: {
                        _id: null,
                        average: { $avg: "$rating" },
                        total: { $sum: 1 }
                    }
                }
            ])
        ]);

        const stats = resumen[0] || { average: 0, total: 0 };

        return {
            reviews,
            // Se redondea a un decimal: 4.333... no aporta nada al usuario
            average: Math.round(stats.average * 10) / 10,
            total: stats.total
        };
    }

    // Calificacion promedio de todas las ubicaciones que tienen resenas
    async getAverages() {
        return ReviewModel.aggregate([
            {
                $group: {
                    _id: "$location",
                    average: { $avg: "$rating" },
                    total: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "locations", // Nombre de la coleccion en MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "location"
                }
            },
            { $unwind: "$location" },
            {
                $project: {
                    _id: 0,
                    locationId: "$_id",
                    location: "$location.name",
                    average: { $round: ["$average", 1] },
                    total: 1
                }
            },
            { $sort: { average: -1, total: -1 } }
        ]);
    }
}

module.exports = ReviewsService;
