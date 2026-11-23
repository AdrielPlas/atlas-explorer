"use strict";

const mongoose = require("mongoose");

// Abre la conexion con MongoDB Atlas usando la cadena del .env
async function connectDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("Falta la variable MONGODB_URI en el archivo .env");
    }

    await mongoose.connect(uri);

    console.log(`MongoDB conectado a la base: ${mongoose.connection.name}`);
}

// Cierra la conexion (se usa al apagar el servidor y al terminar el seed)
async function disconnectDatabase() {
    await mongoose.disconnect();
}

module.exports = {
    connectDatabase,
    disconnectDatabase
};
