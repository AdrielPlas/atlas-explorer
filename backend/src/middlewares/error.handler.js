"use strict";

/**
 * Manejo centralizado de errores.
 * Son los dos ultimos middlewares que se registran en app.js:
 * primero el 404 de rutas que no existen y al final el errorHandler,
 * que es el unico lugar donde se arma una respuesta de error.
 */

const AppError = require("../utils/appError");

// Se ejecuta cuando ninguna ruta coincidio con la peticion
function notFoundHandler(req, res, next) {
    next(
        new AppError(404, `La ruta ${req.method} ${req.originalUrl} no existe.`)
    );
}

// Arma la respuesta de error. Lleva 4 parametros: asi Express lo reconoce
function errorHandler(err, req, res, next) {
    // Plantilla comun para que todas las respuestas de error se vean igual
    const responder = (status, message, details = null) =>
        res.status(status).json({
            error: {
                status,
                message,
                details,
                path: req.originalUrl,
                timeStamp: new Date().toISOString()
            }
        });

    // JSON mal escrito en el cuerpo de la peticion
    if (err instanceof SyntaxError && "body" in err) {
        return responder(400, "El cuerpo del JSON tiene un error de sintaxis.");
    }

    // Validaciones del esquema de Mongoose (required, enum, min, max)
    // Sin esto responderian 500, cuando el error en realidad es del cliente
    if (err.name === "ValidationError") {
        const details = Object.values(err.errors).map((campo) => campo.message);

        return responder(400, "La informacion enviada no es valida.", details);
    }

    // Un valor con formato que MongoDB no entiende (por ejemplo un id mal escrito)
    if (err.name === "CastError") {
        return responder(
            400,
            `El valor "${err.value}" no es valido para el campo ${err.path}.`
        );
    }

    // Indice unico repetido: correo ya registrado, categoria duplicada, etc.
    if (err.code === 11000) {
        const campo = Object.keys(err.keyValue || {})[0] || "campo";

        return responder(409, `Ya existe un registro con ese ${campo}.`);
    }

    // Token de sesion invalido o vencido
    if (err.name === "JsonWebTokenError") {
        return responder(401, "El token de sesion no es valido.");
    }

    if (err.name === "TokenExpiredError") {
        return responder(401, "Tu sesion expiro, vuelve a iniciar sesion.");
    }

    // Errores propios lanzados con AppError
    if (err instanceof AppError) {
        return responder(err.statusCode, err.message, err.details);
    }

    // Cualquier otra cosa es un error no previsto: se registra y se responde 500
    console.error("---------------ERROR-----------------");
    console.error(`Fecha ${new Date().toISOString()}`);
    console.error(`Metodo: ${req.method}`);
    console.error(`Ruta ${req.originalUrl}`);
    console.error(`Mensaje: ${err.message}`);
    console.error(err.stack);
    console.error("-------------------------------------");

    // Al cliente nunca se le manda el detalle interno
    return responder(500, "Ocurrio un error interno del servidor.");
}

module.exports = {
    notFoundHandler,
    errorHandler
};
