"use strict";

const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.models");
const AppError = require("../utils/appError");

class AuthService {
    /**
     * Firma el token que identifica al usuario en cada peticion.
     * Dentro del token solo va el id: nunca datos sensibles, porque
     * el contenido de un JWT va codificado pero NO cifrado, y cualquiera
     * que lo intercepte puede leerlo. Lo que no puede es modificarlo
     * sin invalidar la firma.
     */
    signToken(user) {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("Falta la variable JWT_SECRET en el archivo .env");
        }

        return jwt.sign(
            { sub: user.id }, // "sub" (subject) es el campo estandar para el dueno del token
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );
    }

    // Crea una cuenta nueva
    async register({ name, email, password }) {
        const normalizedEmail = String(email).trim().toLowerCase();

        const existing = await UserModel.findOne({ email: normalizedEmail });

        if (existing) {
            throw new AppError(409, "Ese correo ya esta registrado.");
        }

        // El pre("save") del modelo cifra la contrasena antes de guardarla
        const user = await UserModel.create({
            name,
            email: normalizedEmail,
            password
        });

        return {
            user,
            token: this.signToken(user)
        };
    }

    // Valida las credenciales contra el usuario guardado en MongoDB
    async login({ email, password }) {
        const normalizedEmail = String(email).trim().toLowerCase();

        // El campo password tiene select:false, por eso hay que pedirlo
        const user = await UserModel
            .findOne({ email: normalizedEmail })
            .select("+password");

        /**
         * El mismo mensaje si no existe el correo o si la contrasena es
         * incorrecta. Distinguirlos le diria a un atacante que correos
         * estan registrados.
         */
        const credencialesInvalidas = new AppError(
            401,
            "El correo o la contrasena son incorrectos."
        );

        if (!user) {
            throw credencialesInvalidas;
        }

        const passwordCorrecta = await user.comparePassword(password);

        if (!passwordCorrecta) {
            throw credencialesInvalidas;
        }

        return {
            user,
            token: this.signToken(user)
        };
    }

    // Devuelve el usuario de la sesion actual
    async getProfile(userId) {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new AppError(404, "No se encontro el usuario.");
        }

        return user;
    }
}

module.exports = AuthService;
