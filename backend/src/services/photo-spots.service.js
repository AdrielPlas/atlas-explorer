"use strict";

const PhotoSpotModel = require("../models/photo-spot.models");
const LocationModel = require("../models/location.models");
const AppError = require("../utils/appError");
const { buildPoint, buildSearchRegex } = require("../utils/geo");

const POPULATE_SUBJECT = { path: "subject", select: "name category location" };
const POPULATE_AUTHOR = { path: "createdBy", select: "name" };

class PhotoSpotsService {
    // Devuelve los photo spots aplicando los filtros recibidos
    async getAll(filters = {}) {
        return PhotoSpotModel
            .find(this.buildFilter(filters))
            .populate(POPULATE_SUBJECT)
            .populate(POPULATE_AUTHOR)
            .sort({ createdAt: -1 });
    }

    buildFilter(filters = {}) {
        const { search = "", subject = "all", bestTime = "all" } = filters;

        const query = {};

        const searchRegex = buildSearchRegex(search);

        if (searchRegex) {
            query.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        // Todos los angulos de un mismo monumento
        if (subject !== "all") {
            query.subject = subject;
        }

        if (bestTime !== "all") {
            query.bestTime = bestTime;
        }

        return query;
    }

    // Busca un photo spot por id y lanza 404 si no existe
    async getById(id) {
        const photoSpot = await PhotoSpotModel
            .findById(id)
            .populate(POPULATE_SUBJECT)
            .populate(POPULATE_AUTHOR);

        if (!photoSpot) {
            throw new AppError(404, `No se encontro el photo spot con el id ${id}.`);
        }

        return photoSpot;
    }

    // Devuelve los photo spots en GeoJSON para Leaflet
    async getGeoJSON(filters = {}) {
        const photoSpots = await this.getAll(filters);

        return {
            type: "FeatureCollection",
            features: photoSpots.map((photoSpot) => ({
                type: "Feature",
                properties: {
                    id: photoSpot.id,
                    title: photoSpot.title,
                    description: photoSpot.description,
                    subject: photoSpot.subject?.name || null,
                    subjectId: photoSpot.subject?._id?.toString() || null,
                    // Las coordenadas de lo que se fotografia, para que el
                    // frontend pueda dibujar la linea desde el punto al tema
                    subjectCoordinates: photoSpot.subject?.location?.coordinates || null,
                    bestTime: photoSpot.bestTime,
                    createdBy: photoSpot.createdBy?.name || null,
                    createdAt: photoSpot.createdAt,
                    updatedAt: photoSpot.updatedAt
                },
                geometry: photoSpot.point // Donde se para el fotografo
            }))
        };
    }

    /**
     * Comprueba que la ubicacion exista y que su categoria permita photo spots.
     * La regla vive en el campo allowsPhotoSpots de la categoria, no aqui,
     * asi que se cambia desde el CRUD de categorias sin tocar el codigo.
     */
    async assertSubjectIsValid(subjectId) {
        const location = await LocationModel
            .findById(subjectId)
            .populate({ path: "category", select: "name allowsPhotoSpots" });

        if (!location) {
            throw new AppError(400, "La ubicacion que quieres fotografiar no existe.");
        }

        if (location.category && location.category.allowsPhotoSpots === false) {
            throw new AppError(
                400,
                `La categoria "${location.category.name}" no admite photo spots.`
            );
        }

        return location;
    }

    // Registra un photo spot nuevo
    async create(data, user) {
        await this.assertSubjectIsValid(data.subject);

        const photoSpot = await PhotoSpotModel.create({
            title: data.title,
            description: data.description,
            subject: data.subject,
            createdBy: user.id,
            bestTime: data.bestTime,
            point: buildPoint(data.longitude, data.latitude)
        });

        return this.getById(photoSpot.id);
    }

    // Actualiza solo los campos que vengan en el cuerpo (PATCH)
    async update(id, changes) {
        const photoSpot = await PhotoSpotModel.findById(id);

        if (!photoSpot) {
            throw new AppError(404, `No se encontro el photo spot con el id ${id}.`);
        }

        if (changes.subject !== undefined) {
            await this.assertSubjectIsValid(changes.subject);
            photoSpot.subject = changes.subject;
        }

        const campos = ["title", "description", "bestTime"];

        for (const campo of campos) {
            if (changes[campo] !== undefined) {
                photoSpot[campo] = changes[campo];
            }
        }

        // Si llega una sola coordenada se conserva la otra
        if (changes.latitude !== undefined || changes.longitude !== undefined) {
            const [actualLng, actualLat] = photoSpot.point.coordinates;

            photoSpot.point = buildPoint(
                changes.longitude !== undefined ? changes.longitude : actualLng,
                changes.latitude !== undefined ? changes.latitude : actualLat
            );
        }

        await photoSpot.save();

        return this.getById(photoSpot.id);
    }

    // Elimina el photo spot
    async delete(id) {
        const photoSpot = await this.getById(id);

        await PhotoSpotModel.findByIdAndDelete(id);

        return photoSpot;
    }

    // Todos los photo spots de una ubicacion (para su vista de detalle)
    async getBySubject(subjectId) {
        return PhotoSpotModel
            .find({ subject: subjectId })
            .populate(POPULATE_AUTHOR)
            .sort({ bestTime: 1 });
    }
}

module.exports = PhotoSpotsService;
