"use strict";

const express = require("express");

const ReviewsService = require("../services/reviews.service");
const ReviewModel = require("../models/review.models");
const { protect } = require("../middlewares/auth.middleware");
const { assertIsOwnerOrAdmin } = require("../utils/ownership");
const {
    validateObjectId,
    requireFields,
    requireAnyField
} = require("../middlewares/validate.middleware");

const router = express.Router();
const service = new ReviewsService();

const EDITABLES = ["rating", "comment"];

/**
 * Solo el autor (o un administrador) puede editar o borrar una resena.
 * El campo que guarda al dueno aqui se llama "author", no "createdBy".
 */
async function assertCanModify(req, res, next) {
    try {
        const review = await ReviewModel.findById(req.params.id);

        if (!review) {
            return next(); // El servicio lanza el 404 con su mensaje
        }

        assertIsOwnerOrAdmin(review, req.user, "author");

        next();
    } catch (error) {
        next(error);
    }
}

// GET /api/reviews -> lista con filtros
//   ?location=  ?author=  ?minRating=
router.get("/", async (req, res) => {
    const reviews = await service.getAll(req.query);

    res.status(200).json({
        count: reviews.length,
        data: reviews
    });
});

// GET /api/reviews/averages -> calificacion promedio por ubicacion
router.get("/averages", async (req, res) => {
    const averages = await service.getAverages();

    res.status(200).json({
        count: averages.length,
        data: averages
    });
});

// GET /api/reviews/:id -> una resena
router.get("/:id", validateObjectId(), async (req, res) => {
    const review = await service.getById(req.params.id);

    res.status(200).json({ data: review });
});

/**
 * POST /api/reviews -> crea una resena.
 * El indice unico (location, author) impide resenar dos veces el mismo lugar.
 */
router.post(
    "/",
    protect,
    requireFields("rating", "comment", "location"),
    async (req, res) => {
        const review = await service.create(req.body, req.user);

        res.status(201).json({
            message: "Resena publicada correctamente",
            data: review
        });
    }
);

// PATCH /api/reviews/:id -> solo su autor o un admin
router.patch(
    "/:id",
    protect,
    validateObjectId(),
    requireAnyField(...EDITABLES),
    assertCanModify,
    async (req, res) => {
        const review = await service.update(req.params.id, req.body);

        res.status(200).json({
            message: "Resena actualizada correctamente",
            data: review
        });
    }
);

// DELETE /api/reviews/:id -> solo su autor o un admin
router.delete(
    "/:id",
    protect,
    validateObjectId(),
    assertCanModify,
    async (req, res) => {
        const review = await service.delete(req.params.id);

        res.status(200).json({
            message: "Resena eliminada correctamente",
            data: { id: review.id, rating: review.rating }
        });
    }
);

module.exports = router;
