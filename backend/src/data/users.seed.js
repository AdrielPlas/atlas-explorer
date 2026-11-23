"use strict";

/**
 * Usuarios de prueba.
 *
 * Las contrasenas van en texto plano porque el seed usa create(), que dispara
 * el hook pre("save") del modelo y las cifra con bcrypt antes de guardarlas.
 * En la base NUNCA queda la contrasena legible.
 *
 * El primero es el usuario que se entrega para revisar la practica: es admin,
 * asi que puede moderar cualquier contenido, y es el autor de los datos del seed.
 */
const users = [
    {
        name: "Usuario Demo",
        email: "demo@turismo.com",
        password: "demo12345",
        role: "admin"
    },
    {
        name: "Adriel Plascencia",
        email: "adriel@turismo.com",
        password: "adriel12345",
        role: "admin"
    },
    {
        name: "Viajera Anonima",
        email: "viajera@turismo.com",
        password: "viajera12345",
        role: "usuario"
    }
];

module.exports = users;
