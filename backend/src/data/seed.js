"use strict";

require("dotenv").config();

const {
    connectDatabase,
    disconnectDatabase
} = require("../config/database");

const UserModel = require("../models/user.models");
const CategoryModel = require("../models/category.models");
const LocationModel = require("../models/location.models");
const ZoneModel = require("../models/zone.models");
const PhotoSpotModel = require("../models/photo-spot.models");
const ActivityModel = require("../models/activity.models");
const ReviewModel = require("../models/review.models");

const seedUsers = require("./users.seed");
const seedCategories = require("./categories.seed");
const seedZones = require("./zones.seed");
const seedLocations = require("./locations.seed");
const seedPhotoSpots = require("./photo-spots.seed");
const seedActivities = require("./activities.seed");
const seedReviews = require("./reviews.seed");

const { buildPoint, buildPolygon } = require("../utils/geo");

/**
 * Carga inicial de las siete colecciones.
 *
 * El orden importa: cada coleccion necesita los ObjectId de la anterior.
 * Los archivos .seed.js traen los nombres de las referencias en texto
 * ("Monumento", "Centro de Milan") y aqui se cambian por los ids reales
 * que acaba de generar MongoDB.
 */
async function runSeed() {
    try {
        await connectDatabase();

        console.log("");
        console.log("Limpiando las colecciones...");

        // Se vacia todo para que correr el seed dos veces no duplique datos
        await Promise.all([
            ReviewModel.deleteMany({}),
            ActivityModel.deleteMany({}),
            PhotoSpotModel.deleteMany({}),
            LocationModel.deleteMany({}),
            ZoneModel.deleteMany({}),
            CategoryModel.deleteMany({}),
            UserModel.deleteMany({})
        ]);

        // ------------------------------------------------------- 1 usuarios
        /**
         * Se usa create() y no insertMany() porque create() dispara el hook
         * pre("save") del modelo, que es el que cifra las contrasenas.
         * Con insertMany() se guardarian en texto plano.
         */
        const users = await UserModel.create(seedUsers);

        // Mapa correo -> id, para resolver las referencias de las resenas
        const userByEmail = new Map(users.map((u) => [u.email, u._id]));
        const autor = users[0]; // El usuario demo es el dueno de los datos

        console.log(`users:      ${users.length} registros`);

        // ----------------------------------------------------- 2 categorias
        const categories = await CategoryModel.insertMany(seedCategories);

        const categoryByName = new Map(categories.map((c) => [c.name, c._id]));

        console.log(`categories: ${categories.length} registros`);

        // ---------------------------------------------------------- 3 zonas
        const zones = await ZoneModel.insertMany(
            seedZones.map((zone) => ({
                name: zone.name,
                description: zone.description,
                color: zone.color,
                createdBy: autor._id,
                // buildPolygon valida los vertices y cierra el anillo
                area: buildPolygon(zone.coordinates)
            }))
        );

        const zoneByName = new Map(zones.map((z) => [z.name, z._id]));

        console.log(`zones:      ${zones.length} registros`);

        // ----------------------------------------------------- 4 ubicaciones
        const locations = await LocationModel.insertMany(
            seedLocations.map((location) => {
                const categoryId = categoryByName.get(location.category);

                if (!categoryId) {
                    throw new Error(
                        `La ubicacion "${location.name}" apunta a la categoria ` +
                        `"${location.category}", que no existe en el seed.`
                    );
                }

                return {
                    name: location.name,
                    description: location.description,
                    category: categoryId,
                    createdBy: autor._id,
                    address: location.address,
                    priceLevel: location.priceLevel,
                    status: location.status,
                    location: buildPoint(location.longitude, location.latitude)
                };
            })
        );

        const locationByName = new Map(locations.map((l) => [l.name, l._id]));

        console.log(`locations:  ${locations.length} registros`);

        // ----------------------------------------------------- 5 photo spots
        const photoSpots = await PhotoSpotModel.insertMany(
            seedPhotoSpots.map((spot) => {
                const subjectId = locationByName.get(spot.subject);

                if (!subjectId) {
                    throw new Error(
                        `El photo spot "${spot.title}" apunta a la ubicacion ` +
                        `"${spot.subject}", que no existe en el seed.`
                    );
                }

                return {
                    title: spot.title,
                    description: spot.description,
                    subject: subjectId,
                    createdBy: autor._id,
                    bestTime: spot.bestTime,
                    point: buildPoint(spot.longitude, spot.latitude)
                };
            })
        );

        console.log(`photoSpots: ${photoSpots.length} registros`);

        // ----------------------------------------------------- 6 actividades
        const activities = await ActivityModel.insertMany(
            seedActivities.map((activity) => {
                const zoneId = zoneByName.get(activity.zone);

                if (!zoneId) {
                    throw new Error(
                        `La actividad "${activity.title}" apunta a la zona ` +
                        `"${activity.zone}", que no existe en el seed.`
                    );
                }

                return {
                    title: activity.title,
                    description: activity.description,
                    zone: zoneId,
                    createdBy: autor._id,
                    icon: activity.icon,
                    difficulty: activity.difficulty,
                    completedBy: [] // Cada usuario arranca con su lista vacia
                };
            })
        );

        console.log(`activities: ${activities.length} registros`);

        // --------------------------------------------------------- 7 resenas
        const reviews = await ReviewModel.insertMany(
            seedReviews.map((review) => {
                const locationId = locationByName.get(review.location);
                const authorId = userByEmail.get(review.author);

                if (!locationId) {
                    throw new Error(
                        `Una resena apunta a la ubicacion "${review.location}", ` +
                        "que no existe en el seed."
                    );
                }

                if (!authorId) {
                    throw new Error(
                        `Una resena apunta al usuario "${review.author}", ` +
                        "que no existe en el seed."
                    );
                }

                return {
                    rating: review.rating,
                    comment: review.comment,
                    location: locationId,
                    author: authorId
                };
            })
        );

        console.log(`reviews:    ${reviews.length} registros`);

        console.log("");
        console.log("Carga de datos terminada");
        console.log("");
        console.log("Usuario para revisar la practica:");
        console.log("  correo:     demo@turismo.com");
        console.log("  contrasena: demo12345");
        console.log("");
    } catch (error) {
        console.error("Error al cargar los datos:", error.message);
        process.exitCode = 1;
    } finally {
        // Se cierra la conexion pase lo que pase
        await disconnectDatabase();
    }
}

runSeed();
