"use strict";

const AppError = require("../utils/appError");

/**
 * Validacion de los datos de registro e inicio de sesion.
 * Se revisa aqui, antes de llegar al servicio, para responder 400
 * con la lista completa de lo que falta en lugar de ir campo por campo.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

// Valida el cuerpo de POST /api/auth/register
function validateRegister(req, res, next) {
    const errors = [];
    const body = req.body || {};

    if (typeof body.name !== "string" || body.name.trim() === "") {
        errors.push("El nombre es obligatorio.");
    } else if (body.name.trim().length > 80) {
        errors.push("El nombre no debe superar los 80 caracteres.");
    }

    if (typeof body.email !== "string" || body.email.trim() === "") {
        errors.push("El correo es obligatorio.");
    } else if (!EMAIL_REGEX.test(body.email.trim())) {
        errors.push("El correo no tiene un formato valido.");
    }

    if (typeof body.password !== "string" || body.password === "") {
        errors.push("La contrasena es obligatoria.");
    } else if (body.password.length < MIN_PASSWORD) {
        errors.push(`La contrasena debe tener al menos ${MIN_PASSWORD} caracteres.`);
    }

    if (errors.length > 0) {
        return next(
            new AppError(400, "Los datos de registro no son validos.", errors)
        );
    }

    next(); // Sin esto la peticion se queda esperando para siempre
}

// Valida el cuerpo de POST /api/auth/login
function validateLogin(req, res, next) {
    const errors = [];
    const body = req.body || {};

    if (typeof body.email !== "string" || body.email.trim() === "") {
        errors.push("El correo es obligatorio.");
    }

    if (typeof body.password !== "string" || body.password === "") {
        errors.push("La contrasena es obligatoria.");
    }

    if (errors.length > 0) {
        return next(
            new AppError(400, "Faltan datos para iniciar sesion.", errors)
        );
    }

    next();
}

module.exports = {
    validateRegister,
    validateLogin
};
