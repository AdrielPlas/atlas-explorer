"use strict";

/**
 * Zonas de las tres ciudades.
 *
 * Cada zona es un rectangulo que envuelve el centro de su ciudad, lo
 * suficientemente amplio para contener todas sus ubicaciones. Asi el filtro
 * por zona (?zone=) equivale a "muestrame los lugares de esta ciudad".
 *
 * Los vertices van en sentido antihorario y en el orden [longitud, latitud].
 * El anillo se cierra solo en buildPolygon, que repite el primer vertice
 * al final como exige GeoJSON.
 */

// Arma un rectangulo a partir de sus limites, en sentido antihorario
function rectangulo({ lngMin, lngMax, latMin, latMax }) {
    return [
        [lngMin, latMin],
        [lngMax, latMin],
        [lngMax, latMax],
        [lngMin, latMax]
    ];
}

const zones = [
    {
        name: "Centro de Milan",
        description:
            "Del Duomo al Castello Sforzesco, incluyendo los Navigli. " +
            "Es la zona que se recorre a pie en un dia.",
        color: "#d92d20",
        coordinates: rectangulo({
            lngMin: 9.1650, lngMax: 9.2000,
            latMin: 45.4450, latMax: 45.4750
        })
    },
    {
        name: "Centro Historico de Roma",
        description:
            "Del Coliseo al Vaticano, pasando por el Pantheon y la Fontana " +
            "di Trevi. Concentra casi todo lo que hay que ver.",
        color: "#f79009",
        coordinates: rectangulo({
            lngMin: 12.4480, lngMax: 12.4980,
            latMin: 41.8850, latMax: 41.9180
        })
    },
    {
        name: "San Marco y Rialto, Venecia",
        description:
            "El corazon de Venecia: la plaza de San Marco, el Palacio Ducal " +
            "y el puente de Rialto.",
        color: "#1570ef",
        coordinates: rectangulo({
            lngMin: 12.3250, lngMax: 12.3480,
            latMin: 45.4280, latMax: 45.4420
        })
    }
];

module.exports = zones;
