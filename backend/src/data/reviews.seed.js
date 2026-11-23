"use strict";

/**
 * Resenas de prueba.
 *
 * "location" trae el nombre de la ubicacion y "author" el correo del usuario;
 * el seed los cambia por sus ObjectId al insertar.
 *
 * El modelo tiene un indice unico sobre (location, author), asi que no puede
 * haber dos resenas del mismo usuario sobre el mismo lugar.
 */
const reviews = [
    {
        rating: 5,
        comment:
            "Subir a la terraza vale cada escalon. Ir a primera hora: a " +
            "mediodia la fila da la vuelta a la plaza.",
        location: "Duomo di Milano",
        author: "demo@turismo.com"
    },
    {
        rating: 4,
        comment:
            "Impresionante por dentro, aunque los museos se sienten repetitivos " +
            "si ya viste otros. El parque de atras compensa.",
        location: "Castello Sforzesco",
        author: "viajera@turismo.com"
    },
    {
        rating: 5,
        comment:
            "El aperitivo junto al canal es la mejor hora del dia en Milan. " +
            "Caro, pero se entiende por que.",
        location: "Navigli",
        author: "demo@turismo.com"
    },
    {
        rating: 5,
        comment:
            "Mas grande de lo que uno imagina. Comprar la entrada en linea: " +
            "en taquilla se pierde una hora facil.",
        location: "Colosseo",
        author: "adriel@turismo.com"
    },
    {
        rating: 3,
        comment:
            "La fuente es espectacular, pero a cualquier hora razonable hay " +
            "tanta gente que no se puede ni ver. De madrugada es otra cosa.",
        location: "Fontana di Trevi",
        author: "viajera@turismo.com"
    },
    {
        rating: 5,
        comment:
            "Entrar y mirar hacia arriba al oculo. Que esto siga en pie dos " +
            "mil anos despues no tiene explicacion.",
        location: "Pantheon",
        author: "demo@turismo.com"
    },
    {
        rating: 5,
        comment:
            "La mejor vista de Roma y es gratis. Subir caminando desde " +
            "Trastevere para llegar justo al atardecer.",
        location: "Gianicolo",
        author: "adriel@turismo.com"
    },
    {
        rating: 4,
        comment:
            "La carbonara estuvo muy bien. Esta a dos calles del Pantheon, " +
            "asi que los precios lo reflejan.",
        location: "Osteria del Pantheon",
        author: "viajera@turismo.com"
    },
    {
        rating: 5,
        comment:
            "Llegar temprano y sentarse a ver la plaza despertar, antes de " +
            "que bajen los grupos de los cruceros.",
        location: "Piazza San Marco",
        author: "demo@turismo.com"
    },
    {
        rating: 4,
        comment:
            "El elevador ahorra la subida y la vista cubre toda la laguna. " +
            "Arriba se llena rapido, asi que hay que tener paciencia.",
        location: "Campanile di San Marco",
        author: "adriel@turismo.com"
    },
    {
        rating: 5,
        comment:
            "Cicchetti de pie con un vaso de vino: comer asi cuesta la " +
            "tercera parte que sentarse en un restaurante de la plaza.",
        location: "Bacaro di Rialto",
        author: "viajera@turismo.com"
    }
];

module.exports = reviews;
