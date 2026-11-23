"use strict";

const express = require("express");

const ZonesService = require("../services/zones.service");
const ActivitiesService = require("../services/activities.service");
const AppError = require("../utils/appError");
const { protect } = require("../middlewares/auth.middleware");
const {
    validateObjectId,
    requireFields,
    requireAnyField
} = require("../middlewares/validate.middleware");

const router = express.Router();
const service = new ZonesService();
const activitiesService = new ActivitiesService();

const EDITABLES = ["name", "description", "color", "coordinates"];

// GET /api/zones -> lista de zonas
router.get("/", async (req, res) => {
    const zones = await service.getAll(req.query);

    res.status(200).json({
        count: zones.length,
        data: zones
    });
});

// GET /api/zones/geojson -> los poligonos para dibujarlos con Leaflet
router.get("/geojson", async (req, res) => {
    const geoJSON = await service.getGeoJSON(req.query);

    res.status(200).json(geoJSON);
});

/**
 * GET /api/zones/containing?lat=&lng= -> que zonas contienen ese punto.
 * Usa $geoIntersects contra el indice 2dsphere de los poligonos.
 */
router.get("/containing", async (req, res) => {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
        throw new AppError(400, "Manda los parametros lat y lng.");
    }

    const zones = await service.getZonesContainingPoint(lng, lat);

    res.status(200).json({
        count: zones.length,
        data: zones
    });
});

// GET /api/zones/:id -> una zona
router.get("/:id", validateObjectId(), async (req, res) => {
    const zone = await service.getById(req.params.id);

    res.status(200).json({ data: zone });
});

// GET /api/zones/:id/summary -> la zona con sus conteos
router.get("/:id/summary", validateObjectId(), async (req, res) => {
    const summary = await service.getSummary(req.params.id);

    res.status(200).json({ data: summary });
});

// GET /api/zones/:id/activities -> el checklist de una zona
router.get("/:id/activities", validateObjectId(), async (req, res) => {
    const activities = await activitiesService.getAll(
        { zone: req.params.id },
        req.user // Si hay sesion, cada actividad dice si YO la complete
    );

    res.status(200).json({
        count: activities.length,
        data: activities
    });
});

/**
 * POST /api/zones -> guarda el poligono que dibujo el usuario.
 * El cuerpo lleva "coordinates" con los vertices [[lng, lat], ...];
 * buildPolygon los valida y cierra el anillo si hace falta.
 */
router.post(
    "/",
    protect,
    requireFields("name", "coordinates"),
    async (req, res) => {
        const zone = await service.create(req.body, req.user);

        res.status(201).json({
            message: "Zona creada correctamente",
            data: zone
        });
    }
);

// PATCH /api/zones/:id -> actualiza la zona, incluso su poligono
router.patch(
    "/:id",
    protect,
    validateObjectId(),
    requireAnyField(...EDITABLES),
    async (req, res) => {
        const zone = await service.update(req.params.id, req.body);

        res.status(200).json({
            message: "Zona actualizada correctamente",
            data: zone
        });
    }
);

// DELETE /api/zones/:id -> elimina la zona y sus actividades
router.delete(
    "/:id",
    protect,
    validateObjectId(),
    async (req, res) => {
        const { zone, removed } = await service.delete(req.params.id);

        res.status(200).json({
            message: "Zona eliminada correctamente",
            data: { id: zone.id, name: zone.name },
            removed // Cuantas actividades se borraron con ella
        });
    }
);

module.exports = router;
