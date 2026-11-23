"use strict";

const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.models");
const AppError = require("../utils/appError");

/**
 * Protege las rutas internas.
 * Lee el token del header Authorization, lo verifica y deja al usuario
 * en req.user para que los servicios sepan quien hizo la peticion.
 *
 * El header tiene la forma:  Authorization: Bearer <token>
 */
async function protect(req, res, next) {
    try {
        const header = req.headers.authorization || "";

        if (!header.startsWith("Bearer ")) {
            throw new AppError(401, "Necesitas iniciar sesion para hacer esto.");
        }

        const token = header.slice(7).trim(); // Quita el "Bearer "

        if (!token) {
            throw new AppError(401, "Necesitas iniciar sesion para hacer esto.");
        }

        // Si la firma no cuadra o el token vencio, jwt lanza su propio error
        // y el errorHandler lo traduce a un 401
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        /**
         * Se vuelve a buscar al usuario en lugar de confiar solo en el token.
         * Asi, si la cuenta se elimino despues de que se emitio el token,
         * el acceso se corta de inmediato.
         */
        const user = await UserModel.findById(payload.sub);

        if (!user) {
            throw new AppError(401, "La cuenta de este token ya no existe.");
        }

        req.user = user; // Disponible en todos los handlers que vengan despues

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Restringe una ruta a ciertos roles. Se usa despues de protect:
 *   router.delete("/:id", protect, restrictTo("admin"), handler)
 */
function restrictTo(...roles) {
    return function roleGuard(req, res, next) {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new AppError(403, "No tienes permiso para hacer esto.")
            );
        }

        next();
    };
}

module.exports = {
    protect,
    restrictTo
};
