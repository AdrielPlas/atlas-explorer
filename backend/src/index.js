"use strict";

require("dotenv").config(); // Carga el .env antes que cualquier otra cosa

const app = require("./app");
const {
    connectDatabase,
    disconnectDatabase
} = require("./config/database");

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
    try {
        // Primero la base de datos: sin ella no tiene sentido atender peticiones
        await connectDatabase();

        const server = app.listen(PORT, () => {
            console.log("");
            console.log("=========================================");
            console.log("API DE TURISMO GEOREFERENCIADO");
            console.log("=========================================");
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log(`Health:   http://localhost:${PORT}/api/health`);
            console.log(`Auth:     http://localhost:${PORT}/api/auth`);
            console.log("=========================================");
            console.log("");
        });

        // Cierre controlado: primero el servidor, luego MongoDB
        const shutdown = async (signal) => {
            console.log(`\n${signal} recibido, cerrando...`);

            server.close(async () => {
                await disconnectDatabase();
                console.log("Conexiones cerradas correctamente");
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("No se pudo iniciar el servidor:", error.message);
        process.exit(1);
    }
}

// Arranque del servidor
startServer();
