"use strict";

const express = require("express");

const ActivitiesService = require("../services/activities.service");
const AppError = require("../utils/appError");
const { protect } = require("../middlewares/auth.middleware");
const {
    validateObjectId,
    requireFields,
    requireAnyField
} = require("../middlewares/validate.middleware");

const router = express.Router();
const service = new ActivitiesService();

const EDITABLES = ["title", "description", "zone", "icon", "difficulty"];

/**
 * Deja al usuario en req.user si manda token, pero no obliga a tener sesion.
 * Se usa en las rutas publicas de lectura: sin sesion la lista se ve igual,
 * solo que "completed" sale en false porque no hay con quien compararla.
 */
async function optionalAuth(req, res, next) {
    if (!req.headers.authorization) {
        return next();
    }

    // Con token se reutiliza protect, asi la verificacion es la misma
    return protect(req, res, next);
}

// GET /api/activities -> lista de actividades
router.get("/", optionalAuth, async (req, res) => {
    const activities = await service.getAll(req.query, req.user);

    res.status(200).json({
        count: activities.length,
        data: activities
    });
});

/**
 * GET /api/activities/nearby?lat=&lng= -> el checklist que se activa
 * segun donde esta parado el usuario. Primero busca las zonas que
 * contienen el punto y despues las actividades de esas zonas.
 */
router.get("/nearby", optionalAuth, async (req, res) => {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
        throw new AppError(
            400,
            "Manda los parametros lat y lng con tu posicion actual."
        );
    }

    const resultado = await service.getNearby(lng, lat, req.user);

    res.status(200).json({ data: resultado });
});

/**
 * GET /api/activities/my-checklist -> la lista del usuario de la sesion,
 * agrupada por zona y con su progreso. Requiere sesion: es personal.
 */
router.get("/my-checklist", protect, async (req, res) => {
    const checklist = await service.getMyChecklist(req.user);

    res.status(200).json({ data: checklist });
});

// GET /api/activities/:id -> una actividad
router.get("/:id", optionalAuth, validateObjectId(), async (req, res) => {
    const activity = await service.getById(req.params.id, req.user);

    res.status(200).json({ data: activity });
});

// POST /api/activities -> crea una actividad dentro de una zona
router.post(
    "/",
    protect,
    requireFields("title", "zone"),
    async (req, res) => {
        const activity = await service.create(req.body, req.user);

        res.status(201).json({
            message: "Actividad creada correctamente",
            data: activity
        });
    }
);

/**
 * POST /api/activities/:id/complete -> la marco el usuario de la sesion.
 * Usa $addToSet, asi que repetir la peticion no duplica nada.
 */
router.post(
    "/:id/complete",
    protect,
    validateObjectId(),
    async (req, res) => {
        const activity = await service.markCompleted(req.params.id, req.user);

        res.status(200).json({
            message: "Actividad marcada como completada",
            data: activity
        });
    }
);

// DELETE /api/activities/:id/complete -> la desmarca para este usuario
router.delete(
    "/:id/complete",
    protect,
    validateObjectId(),
    async (req, res) => {
        const activity = await service.unmarkCompleted(req.params.id, req.user);

        res.status(200).json({
            message: "Actividad desmarcada",
            data: activity
        });
    }
);

// PATCH /api/activities/:id -> actualiza los campos enviados
router.patch(
    "/:id",
    protect,
    validateObjectId(),
    requireAnyField(...EDITABLES),
    async (req, res) => {
        const activity = await service.update(req.params.id, req.body, req.user);

        res.status(200).json({
            message: "Actividad actualizada correctamente",
            data: activity
        });
    }
);

// DELETE /api/activities/:id -> elimina la actividad
router.delete(
    "/:id",
    protect,
    validateObjectId(),
    async (req, res) => {
        const activity = await service.delete(req.params.id, req.user);

        res.status(200).json({
            message: "Actividad eliminada correctamente",
            data: { id: activity.id, title: activity.title }
        });
    }
);

module.exports = router;
