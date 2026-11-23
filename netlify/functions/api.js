"use strict";

/**
 * Punto de entrada del backend en Netlify.
 *
 * Netlify no ejecuta un servidor que se queda encendido: ejecuta FUNCIONES,
 * que arrancan cuando llega una peticion y se apagan despues. Por eso aqui
 * no se usa src/index.js (que llama a app.listen) sino src/app.js, y se
 * envuelve la aplicacion de Express con serverless-http para traducir entre
 * el formato de evento de Netlify y lo que Express espera.
 *
 * Las dos adaptaciones importantes estan comentadas abajo: reutilizar la
 * conexion a MongoDB y normalizar la ruta.
 */

const serverless = require("serverless-http");
const mongoose = require("mongoose");

const app = require("../../backend/src/app");

const PREFIJO_FUNCION = "/.netlify/functions/api";

/**
 * Rutas que no consultan la base de datos.
 * /api/health existe para comprobar que el despliegue esta vivo, asi que
 * tiene que responder aunque MongoDB no este disponible: si tambien fallara,
 * no habria forma de distinguir "el backend no subio" de "la base no conecta".
 */
const RUTAS_SIN_BASE = new Set(["/api", "/api/health"]);

/**
 * Conexion reutilizable.
 *
 * Si se conectara en cada peticion, cada invocacion abriria una conexion
 * nueva contra Atlas y acabaria agotando el limite del cluster. Node
 * conserva las variables del modulo entre invocaciones de la misma instancia,
 * asi que se guarda la promesa de conexion y se reutiliza mientras la
 * instancia siga viva.
 */
let promesaConexion = null;

async function conectarUnaVez() {
    // 1 = conectado. Si ya lo esta, no hay nada que hacer
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!promesaConexion) {
        promesaConexion = mongoose
            .connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 8000, // La funcion tiene 10 s de limite
                maxPoolSize: 5 // Una funcion atiende una peticion a la vez
            })
            .catch((error) => {
                // Si falla, se descarta la promesa para poder reintentar
                promesaConexion = null;
                throw error;
            });
    }

    await promesaConexion;
}

/**
 * Normaliza la ruta.
 *
 * Segun como llegue la peticion, Netlify puede entregar la ruta original
 * (/api/locations) o la de la funcion (/.netlify/functions/api/locations).
 * Express tiene sus rutas montadas bajo /api, asi que se deja siempre en
 * esa forma y la funcion responde igual por los dos caminos.
 */
function normalizarRuta(ruta = "/") {
    let limpia = ruta;

    if (limpia.startsWith(PREFIJO_FUNCION)) {
        limpia = limpia.slice(PREFIJO_FUNCION.length) || "/";
    }

    if (!limpia.startsWith("/")) {
        limpia = `/${limpia}`;
    }

    // La raiz de la funcion corresponde a la raiz de la API
    if (limpia === "/") {
        return "/api";
    }

    return limpia.startsWith("/api") ? limpia : `/api${limpia}`;
}

const manejador = serverless(app);

exports.handler = async (event, context) => {
    /**
     * Sin esto, Netlify espera a que el bucle de eventos quede vacio antes
     * de responder. Como la conexion a MongoDB se deja abierta a proposito
     * para reutilizarla, esa espera agotaria el tiempo de la funcion.
     */
    context.callbackWaitsForEmptyEventLoop = false;

    const ruta = normalizarRuta(event.path);

    try {
        // La comprobacion de salud no necesita la base
        if (!RUTAS_SIN_BASE.has(ruta)) {
            await conectarUnaVez();
        }
    } catch (error) {
        console.error("No se pudo conectar a MongoDB:", error.message);

        // Mismo formato de error que usa el errorHandler de la aplicacion
        return {
            statusCode: 503,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: {
                    status: 503,
                    message: "La base de datos no esta disponible en este momento.",
                    details: null,
                    path: event.path,
                    timeStamp: new Date().toISOString()
                }
            })
        };
    }

    const evento = { ...event, path: ruta };

    return manejador(evento, context);
};

// Se exporta aparte para poder probarla sin levantar nada
exports.normalizarRuta = normalizarRuta;
