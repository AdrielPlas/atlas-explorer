"use strict";

const mongoose = require("mongoose");

/**
 * Punto fotografico: el lugar desde donde se toma una buena foto.
 * No es una ubicacion mas: es un punto que APUNTA a otra ubicacion.
 * Un mismo monumento puede tener muchos photo spots repartidos por la ciudad,
 * cada uno con su angulo y su mejor hora del dia.
 */
const photoSpotSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "El titulo es obligatorio"],
            trim: true,
            maxlength: [100, "El titulo no debe superar los 100 caracteres"]
        },
        description: {
            type: String,
            required: [true, "La descripcion es obligatoria"],
            trim: true,
            maxlength: [500, "La descripcion no debe superar los 500 caracteres"]
        },
        // Que se esta fotografiando: la relacion que distingue a esta entidad
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: [true, "Hay que indicar que ubicacion se fotografia"]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // En fotografia la hora lo es todo
        bestTime: {
            type: String,
            enum: ["amanecer", "mediodia", "atardecer", "noche"],
            default: "atardecer"
        },
        // Donde se para el fotografo (distinto del punto del monumento)
        point: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitud, latitud]
                required: [true, "Las coordenadas son obligatorias"]
            }
        }
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            }
        }
    }
);

photoSpotSchema.index({ point: "2dsphere" });

const PhotoSpotModel = mongoose.model("PhotoSpot", photoSpotSchema);

module.exports = PhotoSpotModel;
