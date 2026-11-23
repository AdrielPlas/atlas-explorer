"use strict";

const express = require("express");
const cors = require("cors");

const routerApi = require("./routes");
const AppError = require("./utils/appError");
const {
    notFoundHandler,
    errorHandler
} = require("./middlewares/error.handler");

const app = express();

// Procesa los cuerpos en JSON y los deja en req.body
app.use(express.json());

/**
 * Hace falta al correr como funcion serverless.
 *
 * serverless-http ya leyo el cuerpo de la peticion y lo deja en req.body
 * como Buffer. El express.json() de arriba se salta el parseo cuando
 * req.body ya tiene algo, asi que sin esto los routers recibirian un
 * Buffer en lugar del objeto y toda validacion responderia 400.
 *
 * Corriendo en local no se ejecuta: ahi express.json() ya dejo un objeto
 * y este middleware no hace nada.
 */
app.use((req, res, next) => {
    if (!Buffer.isBuffer(req.body)) {
        return next();
    }

    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("application/json")) {
        req.body = {};
        return next();
    }

    const texto = req.body.toString("utf8").trim();

    // DELETE y las peticiones sin cuerpo llegan con el Buffer vacio
    if (texto === "") {
        req.body = {};
        return next();
    }

    try {
        req.body = JSON.parse(texto);
    } catch (error) {
        return next(
            new AppError(400, "El cuerpo de la peticion no es JSON valido.")
        );
    }

    next();
});

/**
 * CORS: el frontend corre en otro dominio (Vercel) y el backend en otro
 * (Railway), asi que el navegador exige permiso explicito.
 * Los origenes permitidos salen del .env separados por comas.
 */
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Sin origin son peticiones del propio servidor o de Postman
            if (!origin || allowedOrigins.length === 0) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error(`Origen no permitido por CORS: ${origin}`));
        }
    })
);

// Ruta de cortesia para comprobar que la API respondio
app.get("/", (req, res) => {
    res.status(200).json({
        name: "API de Turismo Georeferenciado",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            categories: "/api/categories",
            locations: "/api/locations",
            zones: "/api/zones",
            photoSpots: "/api/photo-spots",
            activities: "/api/activities",
            reviews: "/api/reviews"
        }
    });
});

// Monta todas las rutas de la API bajo /api
routerApi(app);

// Estos dos van siempre al final y en este orden
app.use(notFoundHandler); // Ninguna ruta coincidio
app.use(errorHandler); // Unico lugar donde se arma una respuesta de error

module.exports = app;
