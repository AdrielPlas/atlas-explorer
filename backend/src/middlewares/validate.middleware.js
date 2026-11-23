"use strict";

const mongoose = require("mongoose");

const AppError = require("../utils/appError");

/**
 * Validaciones de datos reutilizables por todas las entidades.
 * Se armaron como fabricas (funciones que devuelven el middleware) para
 * poder configurarlas al registrar la ruta:
 *
 *   router.post("/", requireFields("name", "description"), handler)
 */

/**
 * Revisa que el :id de la ruta sea un ObjectId con formato valido.
 * Sin esto, findById lanzaria un CastError por un id mal escrito,
 * y es mas claro responder 400 desde aqui.
 */
function validateObjectId(paramName = "id") {
    return function objectIdGuard(req, res, next) {
        const value = req.params[paramName];

        if (!mongoose.isValidObjectId(value)) {
            return next(
                new AppError(400, `El id "${value}" no tiene un formato valido.`)
            );
        }

        next();
    };
}

/**
 * Revisa que los campos indicados vengan en el cuerpo y no esten vacios.
 * Junta todos los faltantes en una sola respuesta en lugar de avisar
 * de uno en uno.
 */
function requireFields(...fields) {
    return function fieldsGuard(req, res, next) {
        const body = req.body || {};
        const errors = [];

        for (const field of fields) {
            const value = body[field];

            if (value === undefined || value === null || value === "") {
                errors.push(`El campo "${field}" es obligatorio.`);
            }
        }

        if (errors.length > 0) {
            return next(
                new AppError(400, "Faltan datos obligatorios.", errors)
            );
        }

        next();
    };
}

/**
 * Revisa que el cuerpo traiga al menos uno de los campos indicados.
 * Se usa en los PATCH: un PATCH con el cuerpo vacio no tiene sentido.
 */
function requireAnyField(...fields) {
    return function anyFieldGuard(req, res, next) {
        const body = req.body || {};

        const trajoAlgo = fields.some((field) => body[field] !== undefined);

        if (!trajoAlgo) {
            return next(
                new AppError(
                    400,
                    `Manda al menos uno de estos campos: ${fields.join(", ")}.`
                )
            );
        }

        next();
    };
}

/**
 * Revisa que vengan la latitud y la longitud y que sean numeros en rango.
 * El armado del Point lo hace buildPoint en utils/geo.js; aqui solo se
 * valida para poder responder 400 antes de llegar al servicio.
 */
function requireCoordinates() {
    return function coordinatesGuard(req, res, next) {
        const { latitude, longitude } = req.body || {};
        const errors = [];

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (latitude === undefined || latitude === "") {
            errors.push('El campo "latitude" es obligatorio.');
        } else if (!Number.isFinite(lat)) {
            errors.push("La latitud debe ser un numero.");
        } else if (lat < -90 || lat > 90) {
            errors.push("La latitud debe estar entre -90 y 90.");
        }

        if (longitude === undefined || longitude === "") {
            errors.push('El campo "longitude" es obligatorio.');
        } else if (!Number.isFinite(lng)) {
            errors.push("La longitud debe ser un numero.");
        } else if (lng < -180 || lng > 180) {
            errors.push("La longitud debe estar entre -180 y 180.");
        }

        if (errors.length > 0) {
            return next(
                new AppError(400, "Las coordenadas no son validas.", errors)
            );
        }

        next();
    };
}

module.exports = {
    validateObjectId,
    requireFields,
    requireAnyField,
    requireCoordinates
};
