"use strict";

const ZoneModel = require("../models/zone.models");
const LocationModel = require("../models/location.models");
const ActivityModel = require("../models/activity.models");
const AppError = require("../utils/appError");
const { buildPolygon, buildPoint, buildSearchRegex } = require("../utils/geo");
const { assertIsOwnerOrAdmin } = require("../utils/ownership");

const POPULATE_AUTHOR = { path: "createdBy", select: "name" };

class ZonesService {
    // Devuelve todas las zonas, con filtro opcional por texto
    async getAll(filters = {}) {
        return ZoneModel
            .find(this.buildFilter(filters))
            .populate(POPULATE_AUTHOR)
            .sort({ createdAt: -1 });
    }

    buildFilter(filters = {}) {
        const { search = "" } = filters;

        const query = {};

        const searchRegex = buildSearchRegex(search);

        if (searchRegex) {
            query.$or = [
                { name: searchRegex },
                { description: searchRegex }
            ];
        }

        return query;
    }

    // Busca una zona por id y lanza 404 si no existe
    async getById(id) {
        const zone = await ZoneModel.findById(id).populate(POPULATE_AUTHOR);

        if (!zone) {
            throw new AppError(404, `No se encontro la zona con el id ${id}.`);
        }

        return zone;
    }

    // Devuelve las zonas en GeoJSON para dibujarlas con Leaflet
    async getGeoJSON(filters = {}) {
        const zones = await this.getAll(filters);

        return {
            type: "FeatureCollection",
            features: zones.map((zone) => ({
                type: "Feature",
                properties: {
                    id: zone.id,
                    name: zone.name,
                    description: zone.description,
                    color: zone.color,
                    createdBy: zone.createdBy?.name || null,
                    createdAt: zone.createdAt,
                    updatedAt: zone.updatedAt
                },
                geometry: zone.area // Ya es un Polygon
            }))
        };
    }

    // Guarda la zona que dibujo el usuario sobre el mapa
    async create(data, user) {
        const zone = await ZoneModel.create({
            name: data.name,
            description: data.description,
            color: data.color,
            createdBy: user.id,
            // buildPolygon valida los vertices y cierra el anillo si hace falta
            area: buildPolygon(data.coordinates)
        });

        return this.getById(zone.id);
    }

    // Actualiza solo los campos que vengan en el cuerpo (PATCH)
    async update(id, changes, user) {
        const zone = await ZoneModel.findById(id);

        if (!zone) {
            throw new AppError(404, `No se encontro la zona con el id ${id}.`);
        }

        // Solo quien la trazo, o un administrador, puede modificarla
        assertIsOwnerOrAdmin(zone, user, "createdBy");

        const campos = ["name", "description", "color"];

        for (const campo of campos) {
            if (changes[campo] !== undefined) {
                zone[campo] = changes[campo];
            }
        }

        // Si se redibujo la zona, se vuelve a armar el poligono
        if (changes.coordinates !== undefined) {
            zone.area = buildPolygon(changes.coordinates);
        }

        await zone.save();

        return this.getById(zone.id);
    }

    /**
     * Elimina una zona y sus actividades.
     * Se borran en cascada porque una actividad existe solo dentro de su zona;
     * sin ella no se podria activar nunca.
     */
    async delete(id, user) {
        const zone = await this.getById(id);

        // Misma regla que al editar: dueño o administrador
        assertIsOwnerOrAdmin(zone, user, "createdBy");

        const actividades = await ActivityModel.deleteMany({ zone: id });

        await ZoneModel.findByIdAndDelete(id);

        return {
            zone,
            removed: { activities: actividades.deletedCount }
        };
    }

    /**
     * Devuelve las zonas que contienen un punto.
     * $geoIntersects pregunta "que poligonos se cruzan con esta geometria";
     * como la geometria es un punto, equivale a "que zonas lo contienen".
     * Es la consulta que activa el checklist segun donde esta el usuario.
     */
    async getZonesContainingPoint(longitude, latitude) {
        const point = buildPoint(longitude, latitude);

        return ZoneModel
            .find({ area: { $geoIntersects: { $geometry: point } } })
            .populate(POPULATE_AUTHOR);
    }

    // Cuantas ubicaciones y actividades hay en cada zona
    async getSummary(id) {
        const zone = await this.getById(id);

        const [locations, activities] = await Promise.all([
            LocationModel.countDocuments({
                location: { $geoWithin: { $geometry: zone.area } }
            }),
            ActivityModel.countDocuments({ zone: id })
        ]);

        return {
            ...zone.toJSON(),
            locationsCount: locations,
            activitiesCount: activities
        };
    }
}

module.exports = ZonesService;
