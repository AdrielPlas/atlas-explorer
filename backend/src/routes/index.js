"use strict";

const express = require("express");

const authRouter = require("./auth.router");
const categoriesRouter = require("./categories.router");
const locationsRouter = require("./locations.router");
const zonesRouter = require("./zones.router");
const photoSpotsRouter = require("./photo-spots.router");
const activitiesRouter = require("./activities.router");
const reviewsRouter = require("./reviews.router");

/**
 * Registra todos los routers bajo el prefijo /api.
 * Como apiRouter ya se monta en "/api", aqui las rutas van sin ese prefijo.
 */
function routerApi(app) {
    const apiRouter = express.Router();

    app.use("/api", apiRouter);

    // Comprobacion rapida de que el servicio esta vivo
    apiRouter.get("/health", (req, res) => {
        res.status(200).json({
            status: "ok",
            timeStamp: new Date().toISOString()
        });
    });

    apiRouter.use("/auth", authRouter);
    apiRouter.use("/categories", categoriesRouter);
    apiRouter.use("/locations", locationsRouter);
    apiRouter.use("/zones", zonesRouter);
    apiRouter.use("/photo-spots", photoSpotsRouter);
    apiRouter.use("/activities", activitiesRouter);
    apiRouter.use("/reviews", reviewsRouter);
}

module.exports = routerApi;
