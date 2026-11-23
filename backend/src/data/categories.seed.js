"use strict";

/**
 * Categorias del catalogo.
 * Hotel, restaurante y monumento NO son colecciones distintas:
 * son categorias de la misma entidad Location.
 *
 * allowsPhotoSpots define si las ubicaciones de esa categoria pueden ser
 * el tema de un photo spot. Asi la regla vive en los datos y se cambia
 * desde el CRUD de categorias, sin tocar el codigo.
 */
const categories = [
    {
        name: "Monumento",
        description: "Edificios y obras historicas al aire libre",
        color: "#d92d20",
        icon: "landmark",
        allowsPhotoSpots: true
    },
    {
        name: "Museo",
        description: "Colecciones de arte, historia y ciencia",
        color: "#7a5af8",
        icon: "museum",
        allowsPhotoSpots: true
    },
    {
        name: "Mirador",
        description: "Puntos altos con vista panoramica de la ciudad",
        color: "#0ea5e9",
        icon: "binoculars",
        allowsPhotoSpots: true
    },
    {
        name: "Plaza",
        description: "Espacios publicos abiertos en el centro de la ciudad",
        color: "#16803c",
        icon: "square",
        allowsPhotoSpots: true
    },
    {
        name: "Parque",
        description: "Areas verdes para caminar y descansar",
        color: "#65a30d",
        icon: "tree",
        allowsPhotoSpots: true
    },
    {
        name: "Restaurante",
        description: "Lugares para comer y probar la cocina local",
        color: "#f79009",
        icon: "utensils",
        allowsPhotoSpots: false
    },
    {
        name: "Hotel",
        description: "Hospedaje para la estancia",
        color: "#667085",
        icon: "bed",
        allowsPhotoSpots: false
    }
];

module.exports = categories;
