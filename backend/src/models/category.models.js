"use strict";

const mongoose = require("mongoose");

/**
 * Categoria de una ubicacion: Hotel, Restaurante, Monumento, Museo,
 * Mirador, Parque, Plaza. Es el primero de los CRUD propios del proyecto
 * y la relacion que usa Location con populate.
 */
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre de la categoria es obligatorio"],
            unique: true, // No tiene sentido tener dos categorias "Hotel"
            trim: true,
            maxlength: [50, "El nombre no debe superar los 50 caracteres"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, "La descripcion no debe superar los 200 caracteres"],
            default: ""
        },
        // Color del marcador en el mapa y de la etiqueta en la tabla
        color: {
            type: String,
            required: [true, "El color es obligatorio"],
            match: [/^#[0-9a-fA-F]{6}$/, "El color debe ser hexadecimal, por ejemplo #1570ef"]
        },
        // Nombre del icono que usa el frontend
        icon: {
            type: String,
            trim: true,
            default: "pin"
        },
        /**
         * Define si las ubicaciones de esta categoria pueden ser el tema
         * de un photo spot. Asi la regla vive en los datos y se cambia desde
         * el CRUD de categorias, sin tocar el codigo.
         */
        allowsPhotoSpots: {
            type: Boolean,
            default: true
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

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
