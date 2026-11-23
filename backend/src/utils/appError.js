"use strict";

/**
 * Error propio de la aplicacion.
 * Extiende Error para poder cargar el codigo HTTP y, opcionalmente,
 * una lista de detalles (por ejemplo los campos que fallaron en una validacion).
 * El errorHandler lo reconoce por su statusCode y arma la respuesta.
 */
class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message); // Guarda el mensaje en la propiedad heredada

        this.statusCode = statusCode; // 400, 401, 404, etc.
        this.details = details; // Informacion extra para el cliente
        this.isOperational = true; // Marca que es un error previsto, no un bug

        // Quita el constructor del stack trace para que apunte a donde se lanzo
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
