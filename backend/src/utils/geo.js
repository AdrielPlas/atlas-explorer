"use strict";

const AppError = require("./appError");

/**
 * Utilidades de GeoJSON compartidas por todos los servicios.
 * Se centralizan aqui para no repetir en cada entidad la regla
 * de que las coordenadas van en el orden [longitud, latitud].
 */

// Arma un Point a partir de la longitud y la latitud que manda el cliente
function buildPoint(longitude, latitude) {
    const lng = Number(longitude);
    const lat = Number(latitude);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        throw new AppError(400, "Las coordenadas deben ser numeros validos.");
    }

    if (lat < -90 || lat > 90) {
        throw new AppError(400, "La latitud debe estar entre -90 y 90.");
    }

    if (lng < -180 || lng > 180) {
        throw new AppError(400, "La longitud debe estar entre -180 y 180.");
    }

    return {
        type: "Point",
        // GeoJSON siempre guarda [longitud, latitud], al reves que Leaflet
        coordinates: [lng, lat]
    };
}

/**
 * Arma un Polygon a partir de los vertices que dibujo el usuario.
 * Leaflet entrega los vertices sin cerrar el anillo, pero GeoJSON exige
 * que el primer punto y el ultimo sean iguales, asi que se cierra aqui.
 */
function buildPolygon(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new AppError(400, "La zona necesita sus coordenadas.");
    }

    // Se acepta tanto [[lng, lat], ...] como [[[lng, lat], ...]] (anillo ya envuelto)
    const ring = Array.isArray(coordinates[0][0])
        ? [...coordinates[0]]
        : [...coordinates];

    if (ring.length < 3) {
        throw new AppError(400, "Un poligono necesita al menos 3 vertices.");
    }

    for (const vertex of ring) {
        if (!Array.isArray(vertex) || vertex.length !== 2) {
            throw new AppError(400, "Cada vertice debe ser un par [longitud, latitud].");
        }

        const [lng, lat] = vertex.map(Number);

        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
            throw new AppError(400, "Los vertices deben ser numeros validos.");
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new AppError(400, "Hay un vertice fuera del rango de coordenadas.");
        }
    }

    const first = ring[0];
    const last = ring[ring.length - 1];

    // Cierra el anillo si el usuario no lo cerro
    if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push([...first]);
    }

    return {
        type: "Polygon",
        coordinates: [ring.map(([lng, lat]) => [Number(lng), Number(lat)])]
    };
}

/**
 * Deja el texto en minusculas y sin acentos.
 * Se usa para comparar busquedas sin que importen mayusculas ni tildes.
 */
function normalizeText(value) {
    return String(value)
        .toLowerCase()
        .normalize("NFD") // Separa la letra de su acento
        .replace(/[̀-ͯ]/g, "") // Elimina los acentos sueltos
        .trim();
}

/**
 * Arma la expresion regular para las busquedas de texto parcial.
 * Como el filtro lo resuelve MongoDB y no Node, no se puede normalizar
 * cada registro: en su lugar se normaliza lo que escribio el usuario y
 * cada vocal se convierte en un grupo que acepta sus versiones acentuadas.
 */
function buildSearchRegex(value) {
    const text = normalizeText(value);

    if (!text) {
        return null; // Sin texto no se agrega el filtro
    }

    const accents = {
        a: "[aáàä]", e: "[eéèë]", i: "[iíìï]",
        o: "[oóòö]", u: "[uúùü]", n: "[nñ]", c: "[cç]"
    };

    const pattern = text
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escapa los simbolos propios de regex
        .replace(/[aeiounc]/g, (letter) => accents[letter]);

    return new RegExp(pattern, "i"); // "i" = ignora mayusculas
}

module.exports = {
    buildPoint,
    buildPolygon,
    normalizeText,
    buildSearchRegex
};
