"use strict";

const express = require("express");

const LocationsService = require("../services/locations.service");
const ReviewsService = require("../services/reviews.service");
const PhotoSpotsService = require("../services/photo-spots.service");
const { protect } = require("../middlewares/auth.middleware");
const {
    validateObjectId,
    requireFields,
    requireAnyField,
    requireCoordinates
} = require("../middlewares/validate.middleware");

const router = express.Router();
const service = new LocationsService();
const reviewsService = new ReviewsService();
const photoSpotsService = new PhotoSpotsService();

const EDITABLES = [
    "name", "description", "category", "address",
    "priceLevel", "status", "latitude", "longitude"
];

/**
 * GET /api/locations -> lista con los tres filtros de la rubrica
 *   ?search=  texto parcial en nombre, descripcion y direccion
 *   ?category= id de la categoria
 *   ?zone=    id de la zona (filtra por $geoWithin)
 */
router.get("/", async (req, res) => {
    const locations = await service.getAll(req.query);

    res.status(200).json({
        count: locations.length,
        data: locations
    });
});

// Las rutas fijas van antes de "/:id" para que no las capture como un id
// GET /api/locations/geojson -> la misma lista para Leaflet
router.get("/geojson", async (req, res) => {
    const geoJSON = await service.getGeoJSON(req.query);

    res.status(200).json(geoJSON);
});

// GET /api/locations/stats -> conteos para la vista principal
router.get("/stats", async (req, res) => {
    const stats = await service.getStats();

    res.status(200).json({ data: stats });
});

// GET /api/locations/averages -> calificacion promedio por ubicacion
router.get("/averages", async (req, res) => {
    const averages = await reviewsService.getAverages();

    res.status(200).json({
        count: averages.length,
        data: averages
    });
});

// GET /api/locations/:id -> una ubicacion con su categoria poblada
router.get("/:id", validateObjectId(), async (req, res) => {
    const location = await service.getById(req.params.id);

    res.status(200).json({ data: location });
});

/**
 * GET /api/locations/:id/detail -> todo lo de la vista de detalle en una
 * sola peticion: la ubicacion, sus resenas con el promedio y sus photo spots.
 */
router.get("/:id/detail", validateObjectId(), async (req, res) => {
    const location = await service.getById(req.params.id);

    const [reviews, photoSpots] = await Promise.all([
        reviewsService.getByLocation(req.params.id),
        photoSpotsService.getBySubject(req.params.id)
    ]);

    res.status(200).json({
        data: {
            location,
            reviews: reviews.reviews,
            rating: { average: reviews.average, total: reviews.total },
            photoSpots
        }
    });
});

// GET /api/locations/:id/reviews -> las resenas de una ubicacion
router.get("/:id/reviews", validateObjectId(), async (req, res) => {
    const resultado = await reviewsService.getByLocation(req.params.id);

    res.status(200).json({
        count: resultado.total,
        average: resultado.average,
        data: resultado.reviews
    });
});

// GET /api/locations/:id/photo-spots -> los photo spots de una ubicacion
router.get("/:id/photo-spots", validateObjectId(), async (req, res) => {
    const photoSpots = await photoSpotsService.getBySubject(req.params.id);

    res.status(200).json({
        count: photoSpots.length,
        data: photoSpots
    });
});

// POST /api/locations -> registra la ubicacion del clic en el mapa
router.post(
    "/",
    protect,
    requireFields("name", "description", "category"),
    requireCoordinates(),
    async (req, res) => {
        const location = await service.create(req.body, req.user);

        res.status(201).json({
            message: "Ubicacion registrada correctamente",
            data: location
        });
    }
);

// PATCH /api/locations/:id -> edicion desde el popup
router.patch(
    "/:id",
    protect,
    validateObjectId(),
    requireAnyField(...EDITABLES),
    async (req, res) => {
        const location = await service.update(req.params.id, req.body, req.user);

        res.status(200).json({
            message: "Ubicacion actualizada correctamente",
            data: location
        });
    }
);

// DELETE /api/locations/:id -> elimina la ubicacion, sus resenas y sus photo spots
router.delete(
    "/:id",
    protect,
    validateObjectId(),
    async (req, res) => {
        const { location, removed } = await service.delete(req.params.id, req.user);

        res.status(200).json({
            message: "Ubicacion eliminada correctamente",
            data: { id: location.id, name: location.name },
            removed // Cuantas resenas y photo spots se borraron con ella
        });
    }
);

module.exports = router;
