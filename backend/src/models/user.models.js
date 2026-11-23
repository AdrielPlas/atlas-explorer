"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Vueltas de cifrado. Mas vueltas = mas seguro pero mas lento; 10 es el estandar
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true,
            maxlength: [80, "El nombre no debe superar los 80 caracteres"]
        },
        email: {
            type: String,
            required: [true, "El correo es obligatorio"],
            unique: true, // Crea un indice unico: no se permiten correos repetidos
            trim: true,
            lowercase: true, // Para que Ana@X.com y ana@x.com sean el mismo correo
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El correo no tiene un formato valido"]
        },
        password: {
            type: String,
            required: [true, "La contrasena es obligatoria"],
            minlength: [8, "La contrasena debe tener al menos 8 caracteres"],
            // No se incluye en las consultas salvo que se pida con .select("+password")
            select: false
        },
        role: {
            type: String,
            enum: ["usuario", "admin"],
            default: "usuario"
        }
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.password; // Red de seguridad: nunca sale el hash
                return ret;
            }
        }
    }
);

/**
 * Se ejecuta antes de cada save().
 * Cifra la contrasena solo si cambio, para que al editar el nombre
 * no se vuelva a cifrar un hash que ya estaba cifrado.
 *
 * El hook es async y NO recibe "next": Mongoose trata la promesa que
 * devuelve como la senal de que termino. Mezclar async con next hace
 * que next llegue undefined y truene.
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

/**
 * Compara la contrasena en texto plano del login contra el hash guardado.
 * bcrypt saca el salt del propio hash, por eso no hay que guardarlo aparte.
 */
userSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
