"use strict";

const mongoose = require("mongoose");

/**
 * Actividad del checklist: algo que hay que hacer para decir que conociste
 * un lugar ("comerte un gelato" en el centro de Milan).
 *
 * No pertenece a una ubicacion exacta sino a una ZONA: cuando el usuario
 * esta parado dentro del poligono, sus actividades se activan.
 * Esa es la segunda funcion real de las zonas en la aplicacion.
 */
const activitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "El titulo es obligatorio"],
            trim: true,
            maxlength: [100, "El titulo no debe superar los 100 caracteres"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, "La descripcion no debe superar los 300 caracteres"],
            default: ""
        },
        // La zona a la que pertenece: aqui esta lo que la hace especial
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Zone",
            required: [true, "La actividad tiene que pertenecer a una zona"]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        icon: {
            type: String,
            trim: true,
            default: "check"
        },
        difficulty: {
            type: String,
            enum: ["facil", "media", "dificil"],
            default: "facil"
        },
        /**
         * Quienes ya la completaron.
         * Se guarda como arreglo de referencias para no necesitar una
         * coleccion aparte: marcar y desmarcar es un $addToSet y un $pull.
         */
        completedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
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

// Las actividades casi siempre se consultan por zona
activitySchema.index({ zone: 1 });

const ActivityModel = mongoose.model("Activity", activitySchema);

module.exports = ActivityModel;
