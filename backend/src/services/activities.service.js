"use strict";

const ActivityModel = require("../models/activity.models");
const ZoneModel = require("../models/zone.models");
const AppError = require("../utils/appError");
const { buildPoint, buildSearchRegex } = require("../utils/geo");
const { assertIsOwnerOrAdmin } = require("../utils/ownership");

const POPULATE_ZONE = { path: "zone", select: "name color" };
const POPULATE_AUTHOR = { path: "createdBy", select: "name" };

class ActivitiesService {
    /**
     * Da el formato de salida de una actividad.
     *
     * Aqui esta lo importante: el arreglo completedBy NUNCA sale en la
     * respuesta, porque llevaria los ids de todos los usuarios que la
     * completaron. En su lugar se devuelven dos campos calculados para
     * quien pidio la informacion:
     *   completed      -> la complete YO
     *   completedCount -> cuantos la completaron, sin decir quienes
     *
     * Asi cada usuario ve su propia lista aunque el registro sea compartido.
     */
    toResponse(activity, user) {
        const json = activity.toJSON();

        const completedBy = (json.completedBy || []).map((id) => String(id));

        delete json.completedBy; // No se expone quien la completo

        return {
            ...json,
            completed: user ? completedBy.includes(user.id) : false,
            completedCount: completedBy.length
        };
    }

    // Devuelve las actividades aplicando los filtros recibidos
    async getAll(filters = {}, user = null) {
        const activities = await ActivityModel
            .find(this.buildFilter(filters))
            .populate(POPULATE_ZONE)
            .populate(POPULATE_AUTHOR)
            .sort({ createdAt: -1 });

        return activities.map((activity) => this.toResponse(activity, user));
    }

    buildFilter(filters = {}) {
        const { search = "", zone = "all", difficulty = "all" } = filters;

        const query = {};

        const searchRegex = buildSearchRegex(search);

        if (searchRegex) {
            query.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        if (zone !== "all") {
            query.zone = zone;
        }

        if (difficulty !== "all") {
            query.difficulty = difficulty;
        }

        return query;
    }

    // Busca una actividad por id y lanza 404 si no existe
    async getById(id, user = null) {
        const activity = await ActivityModel
            .findById(id)
            .populate(POPULATE_ZONE)
            .populate(POPULATE_AUTHOR);

        if (!activity) {
            throw new AppError(404, `No se encontro la actividad con el id ${id}.`);
        }

        return this.toResponse(activity, user);
    }

    /**
     * El checklist segun donde esta parado el usuario.
     * Primero se buscan las zonas que contienen su posicion y despues las
     * actividades de esas zonas. Es la consulta que le da su segunda funcion
     * a las zonas: sin ellas no habria forma de activar el checklist.
     */
    async getNearby(longitude, latitude, user = null) {
        const point = buildPoint(longitude, latitude);

        // 1. que zonas contienen el punto del usuario
        const zones = await ZoneModel.find({
            area: { $geoIntersects: { $geometry: point } }
        });

        if (zones.length === 0) {
            return {
                zones: [],
                activities: [],
                message: "No estas dentro de ninguna zona registrada."
            };
        }

        // 2. las actividades de esas zonas
        const activities = await ActivityModel
            .find({ zone: { $in: zones.map((zone) => zone._id) } })
            .populate(POPULATE_ZONE)
            .populate(POPULATE_AUTHOR)
            .sort({ createdAt: -1 });

        const lista = activities.map((activity) => this.toResponse(activity, user));

        return {
            zones: zones.map((zone) => ({
                id: zone.id,
                name: zone.name,
                color: zone.color
            })),
            activities: lista,
            // Progreso del usuario dentro de las zonas donde esta
            progress: {
                completed: lista.filter((a) => a.completed).length,
                total: lista.length
            }
        };
    }

    // Comprueba que la zona exista antes de guardar
    async assertZoneExists(zoneId) {
        const existe = await ZoneModel.exists({ _id: zoneId });

        if (!existe) {
            throw new AppError(400, "La zona indicada no existe.");
        }
    }

    // Crea una actividad dentro de una zona
    async create(data, user) {
        await this.assertZoneExists(data.zone);

        const activity = await ActivityModel.create({
            title: data.title,
            description: data.description,
            zone: data.zone,
            createdBy: user.id,
            icon: data.icon,
            difficulty: data.difficulty
        });

        return this.getById(activity.id, user);
    }

    // Actualiza solo los campos que vengan en el cuerpo (PATCH)
    async update(id, changes, user) {
        const activity = await ActivityModel.findById(id);

        if (!activity) {
            throw new AppError(404, `No se encontro la actividad con el id ${id}.`);
        }

        // Solo quien la propuso, o un administrador, puede modificarla
        assertIsOwnerOrAdmin(activity, user, "createdBy");

        if (changes.zone !== undefined) {
            await this.assertZoneExists(changes.zone);
            activity.zone = changes.zone;
        }

        const campos = ["title", "description", "icon", "difficulty"];

        for (const campo of campos) {
            if (changes[campo] !== undefined) {
                activity[campo] = changes[campo];
            }
        }

        await activity.save();

        return this.getById(activity.id, user);
    }

    // Elimina la actividad
    async delete(id, user) {
        const activity = await ActivityModel.findById(id);

        if (!activity) {
            throw new AppError(404, `No se encontro la actividad con el id ${id}.`);
        }

        // Misma regla que al editar: dueño o administrador
        assertIsOwnerOrAdmin(activity, user, "createdBy");

        const respuesta = await this.getById(id, user);

        await activity.deleteOne();

        return respuesta;
    }

    /**
     * Marca la actividad como completada por el usuario de la sesion.
     * $addToSet agrega el id solo si no estaba, asi que marcar dos veces
     * no duplica nada y el endpoint se puede repetir sin consecuencias.
     */
    async markCompleted(id, user) {
        const activity = await ActivityModel.findByIdAndUpdate(
            id,
            { $addToSet: { completedBy: user.id } },
            { new: true } // Devuelve el documento ya actualizado
        )
            .populate(POPULATE_ZONE)
            .populate(POPULATE_AUTHOR);

        if (!activity) {
            throw new AppError(404, `No se encontro la actividad con el id ${id}.`);
        }

        return this.toResponse(activity, user);
    }

    // Desmarca la actividad para el usuario de la sesion
    async unmarkCompleted(id, user) {
        const activity = await ActivityModel.findByIdAndUpdate(
            id,
            { $pull: { completedBy: user.id } },
            { new: true }
        )
            .populate(POPULATE_ZONE)
            .populate(POPULATE_AUTHOR);

        if (!activity) {
            throw new AppError(404, `No se encontro la actividad con el id ${id}.`);
        }

        return this.toResponse(activity, user);
    }

    /**
     * El checklist completo del usuario, agrupado por zona.
     * Es lo que alimenta la vista de "mi lista": solo refleja lo que
     * marco este usuario, nunca lo de los demas.
     */
    async getMyChecklist(user) {
        const activities = await ActivityModel
            .find()
            .populate(POPULATE_ZONE)
            .sort({ createdAt: -1 });

        const porZona = new Map();

        for (const activity of activities) {
            const item = this.toResponse(activity, user);
            const zoneId = activity.zone?._id?.toString() || "sin-zona";

            if (!porZona.has(zoneId)) {
                porZona.set(zoneId, {
                    zone: activity.zone
                        ? {
                            id: zoneId,
                            name: activity.zone.name,
                            color: activity.zone.color
                        }
                        : null,
                    activities: [],
                    completed: 0,
                    total: 0
                });
            }

            const grupo = porZona.get(zoneId);

            grupo.activities.push(item);
            grupo.total += 1;

            if (item.completed) {
                grupo.completed += 1;
            }
        }

        const grupos = [...porZona.values()];

        return {
            zones: grupos,
            progress: {
                completed: grupos.reduce((suma, g) => suma + g.completed, 0),
                total: grupos.reduce((suma, g) => suma + g.total, 0)
            }
        };
    }
}

module.exports = ActivitiesService;
