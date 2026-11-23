"use strict";

const mongoose = require("mongoose");

/**
 * Resena de una ubicacion.
 * Tiene dos relaciones por referencia: la ubicacion resenada y su autor.
 */
const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: [true, "La calificacion es obligatoria"],
            min: [1, "La calificacion va de 1 a 5"],
            max: [5, "La calificacion va de 1 a 5"]
        },
        comment: {
            type: String,
            required: [true, "El comentario es obligatorio"],
            trim: true,
            maxlength: [500, "El comentario no debe superar los 500 caracteres"]
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: [true, "Hay que indicar que ubicacion se resena"]
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

// Indice unico compuesto: un usuario solo puede resenar una vez cada ubicacion
reviewSchema.index({ location: 1, author: 1 }, { unique: true });

const ReviewModel = mongoose.model("Review", reviewSchema);

module.exports = ReviewModel;
