"use strict";

const express = require("express");

const AuthService = require("../services/auth.service");
const { protect } = require("../middlewares/auth.middleware");
const {
    validateRegister,
    validateLogin
} = require("../middlewares/auth.validator");

const router = express.Router();
const service = new AuthService();

// POST /api/auth/register -> crea una cuenta
router.post("/register", validateRegister, async (req, res) => {
    const { user, token } = await service.register(req.body);

    res.status(201).json({ // 201 = recurso creado
        message: "Cuenta creada correctamente",
        data: { user, token } // Se devuelve el token para entrar sin volver a loguear
    });
});

// POST /api/auth/login -> valida credenciales y devuelve el token
router.post("/login", validateLogin, async (req, res) => {
    const { user, token } = await service.login(req.body);

    res.status(200).json({
        message: "Sesion iniciada correctamente",
        data: { user, token }
    });
});

// GET /api/auth/me -> datos del usuario de la sesion actual
// protect se encarga de verificar el token y dejar al usuario en req.user
router.get("/me", protect, async (req, res) => {
    const user = await service.getProfile(req.user.id);

    res.status(200).json({
        data: user
    });
});

module.exports = router;
