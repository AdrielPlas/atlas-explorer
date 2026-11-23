"use strict";

const express = require("express");

const CategoriesService = require("../services/categories.service");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const {
    validateObjectId,
    requireFields,
    requireAnyField
} = require("../middlewares/validate.middleware");

const router = express.Router();
const service = new CategoriesService();

// Campos que acepta un PATCH
const EDITABLES = ["name", "description", "color", "icon", "allowsPhotoSpots"];

// GET /api/categories -> lista de categorias (publica)
router.get("/", async (req, res) => {
    const categories = await service.getAll(req.query);

    res.status(200).json({
        count: categories.length,
        data: categories
    });
});

// GET /api/categories/usage -> cada categoria con su numero de ubicaciones
// Va antes de "/:id" para que la ruta dinamica no la capture
router.get("/usage", async (req, res) => {
    const categories = await service.getUsage();

    res.status(200).json({
        count: categories.length,
        data: categories
    });
});

// GET /api/categories/:id -> una categoria
router.get("/:id", validateObjectId(), async (req, res) => {
    const category = await service.getById(req.params.id);

    res.status(200).json({ data: category });
});

// POST /api/categories -> crea una categoria (requiere sesion)
router.post(
    "/",
    protect,
    restrictTo("admin"),
    requireFields("name", "color"),
    async (req, res) => {
        const category = await service.create(req.body);

        res.status(201).json({
            message: "Categoria creada correctamente",
            data: category
        });
    }
);

// PATCH /api/categories/:id -> actualiza los campos enviados
router.patch(
    "/:id",
    protect,
    restrictTo("admin"),
    validateObjectId(),
    requireAnyField(...EDITABLES),
    async (req, res) => {
        const category = await service.update(req.params.id, req.body);

        res.status(200).json({
            message: "Categoria actualizada correctamente",
            data: category
        });
    }
);

// DELETE /api/categories/:id -> elimina la categoria si nadie la usa
router.delete(
    "/:id",
    protect,
    restrictTo("admin"),
    validateObjectId(),
    async (req, res) => {
        const category = await service.delete(req.params.id);

        res.status(200).json({
            message: "Categoria eliminada correctamente",
            data: { id: category.id, name: category.name }
        });
    }
);

module.exports = router;
