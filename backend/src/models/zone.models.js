"use strict";

const mongoose = require("mongoose");

/**
 * Zona: el poligono que el usuario dibuja sobre el mapa.
 * Tiene dos funciones en la aplicacion:
 *   1. filtrar las ubicaciones que caen dentro de ella ($geoWithin)
 *   2. agrupar las actividades del checklist ($geoIntersects)
 */
const zoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre de la zona es obligatorio"],
            trim: true,
            maxlength: [100, "El nombre no debe superar los 100 caracteres"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, "La descripcion no debe superar los 300 caracteres"],
            default: ""
        },
        color: {
            type: String,
            match: [/^#[0-9a-fA-F]{6}$/, "El color debe ser hexadecimal, por ejemplo #1570ef"],
            default: "#1570ef"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        area: {
            type: {
                type: String,
                enum: ["Polygon"],
                default: "Polygon"
            },
            /**
             * Un Polygon es un arreglo de anillos, y cada anillo un arreglo de
             * vertices [longitud, latitud]. El primer vertice y el ultimo deben
             * ser iguales para cerrar la figura; de eso se encarga buildPolygon.
             */
            coordinates: {
                type: [[[Number]]],
                required: [true, "La zona necesita sus coordenadas"]
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

// Indice geoespacial sobre el poligono
zoneSchema.index({ area: "2dsphere" });

const ZoneModel = mongoose.model("Zone", zoneSchema);

module.exports = ZoneModel;
