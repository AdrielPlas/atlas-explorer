"use strict";

const express = require("express");
const cors = require("cors");

const routerApi = require("./routes");
const {
    notFoundHandler,
    errorHandler
} = require("./middlewares/error.handler");

const app = express();

// Procesa los cuerpos en JSON y los deja en req.body
app.use(express.json());

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
