"use strict";

const express = require("express");

const PhotoSpotsService = require("../services/photo-spots.service");
const PhotoSpotModel = require("../models/photo-spot.models");
const { protect } = require("../middlewares/auth.middleware");
const { assertIsOwnerOrAdmin } = require("../utils/ownership");
const {
    validateObjectId,
    requireFields,
    requireAnyField,
    requireCoordinates
} = require("../middlewares/validate.middleware");

const router = express.Router();
const service = new PhotoSpotsService();

const EDITABLES = ["title", "description", "subject", "bestTime", "latitude", "longitude"];

/**
 * Solo el autor (o un administrador) puede editar o borrar un photo spot.
 * A diferencia del catalogo, esto es contenido con voz propia.
 */
async function assertCanModify(req, res, next) {
    try {
        const photoSpot = await PhotoSpotModel.findById(req.params.id);

        if (!photoSpot) {
            return next(); // El servicio lanza el 404 con su mensaje
        }

        assertIsOwnerOrAdmin(photoSpot, req.user);

        next();
    } catch (error) {
        next(error);
    }
}

// GET /api/photo-spots -> lista con filtros
//   ?subject= todos los angulos de un mismo monumento
//   ?bestTime= amanecer | mediodia | atardecer | noche
router.get("/", async (req, res) => {
    const photoSpots = await service.getAll(req.query);

    res.status(200).json({
        count: photoSpots.length,
        data: photoSpots
    });
});

// GET /api/photo-spots/geojson -> los puntos para Leaflet
router.get("/geojson", async (req, res) => {
    const geoJSON = await service.getGeoJSON(req.query);

    res.status(200).json(geoJSON);
});

// GET /api/photo-spots/:id -> un photo spot con su tema poblado
router.get("/:id", validateObjectId(), async (req, res) => {
    const photoSpot = await service.getById(req.params.id);

    res.status(200).json({ data: photoSpot });
});

/**
 * POST /api/photo-spots -> registra el punto desde donde se toma la foto.
 * Las coordenadas son del fotografo; "subject" es la ubicacion que retrata.
 */
router.post(
    "/",
    protect,
    requireFields("title", "description", "subject"),
    requireCoordinates(),
    async (req, res) => {
        const photoSpot = await service.create(req.body, req.user);

        res.status(201).json({
            message: "Photo spot registrado correctamente",
            data: photoSpot
        });
    }
);

// PATCH /api/photo-spots/:id -> solo su autor o un admin
router.patch(
    "/:id",
    protect,
    validateObjectId(),
    requireAnyField(...EDITABLES),
    assertCanModify,
    async (req, res) => {
        const photoSpot = await service.update(req.params.id, req.body);

        res.status(200).json({
            message: "Photo spot actualizado correctamente",
            data: photoSpot
        });
    }
);

// DELETE /api/photo-spots/:id -> solo su autor o un admin
router.delete(
    "/:id",
    protect,
    validateObjectId(),
    assertCanModify,
    async (req, res) => {
        const photoSpot = await service.delete(req.params.id);

        res.status(200).json({
            message: "Photo spot eliminado correctamente",
            data: { id: photoSpot.id, title: photoSpot.title }
        });
    }
);

module.exports = router;
