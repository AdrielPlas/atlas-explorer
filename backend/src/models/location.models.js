"use strict";

const mongoose = require("mongoose");

/**
 * Ubicacion exacta: el punto que el usuario registra al hacer clic en el mapa.
 * Es la entidad central del proyecto. Hoteles, restaurantes, monumentos y
 * museos NO son colecciones distintas: son esta misma entidad con otra categoria.
 */
const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true,
            maxlength: [100, "El nombre no debe superar los 100 caracteres"]
        },
        description: {
            type: String,
            required: [true, "La descripcion es obligatoria"],
            trim: true,
            maxlength: [500, "La descripcion no debe superar los 500 caracteres"]
        },
        // Relacion por referencia: se resuelve con populate para mostrar el nombre
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "La categoria es obligatoria"]
        },
        // Quien registro la ubicacion
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, "La direccion no debe superar los 200 caracteres"],
            default: ""
        },
        // Rango de precio de 1 a 4, el clasico $ a $$$$
        priceLevel: {
            type: Number,
            min: [1, "El rango de precio va de 1 a 4"],
            max: [4, "El rango de precio va de 1 a 4"],
            default: 1
        },
        status: {
            type: String,
            enum: ["abierto", "cerrado", "temporal"],
            default: "abierto"
        },
        location: {
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

// Indice geoespacial: lo necesita $geoWithin para el filtro por zona
locationSchema.index({ location: "2dsphere" });

const LocationModel = mongoose.model("Location", locationSchema);

module.exports = LocationModel;
