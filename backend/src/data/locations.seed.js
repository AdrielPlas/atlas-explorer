"use strict";

/**
 * Ubicaciones de Milan, Roma y Venecia.
 *
 * El campo "category" trae el NOMBRE de la categoria, no su id: el seed lo
 * cambia por el ObjectId correspondiente al insertar, porque los ids los
 * genera MongoDB y no se conocen antes de correr el seed.
 *
 * Las coordenadas van [longitud, latitud] y son aproximadas al centro de
 * cada lugar; conviene afinarlas en Google Maps si se quiere mas precision.
 */
const locations = [
    // ------------------------------------------------------------- MILAN
    {
        name: "Duomo di Milano",
        description:
            "La catedral gotica de Milan, con su terraza transitable entre " +
            "las agujas de marmol. Conviene llegar temprano para evitar la fila.",
        category: "Monumento",
        address: "Piazza del Duomo, Milan",
        priceLevel: 2,
        status: "abierto",
        longitude: 9.1900,
        latitude: 45.4642
    },
    {
        name: "Galleria Vittorio Emanuele II",
        description:
            "Galeria comercial cubierta del siglo XIX, con mosaicos en el piso " +
            "y una cupula de cristal. Se cruza al salir del Duomo.",
        category: "Monumento",
        address: "Piazza del Duomo, Milan",
        priceLevel: 1,
        status: "abierto",
        longitude: 9.1899,
        latitude: 45.4659
    },
    {
        name: "Castello Sforzesco",
        description:
            "Fortaleza del siglo XV que hoy alberga varios museos municipales. " +
            "Atras tiene el Parco Sempione.",
        category: "Museo",
        address: "Piazza Castello, Milan",
        priceLevel: 2,
        status: "abierto",
        longitude: 9.1795,
        latitude: 45.4702
    },
    {
        name: "Santa Maria delle Grazie",
        description:
            "Iglesia donde se conserva La Ultima Cena de Leonardo. La entrada " +
            "es con horario asignado y se agota semanas antes.",
        category: "Monumento",
        address: "Piazza di Santa Maria delle Grazie, Milan",
        priceLevel: 2,
        status: "abierto",
        longitude: 9.1709,
        latitude: 45.4659
    },
    {
        name: "Navigli",
        description:
            "Barrio de canales con bares a lo largo del agua. Es el lugar del " +
            "aperitivo al atardecer.",
        category: "Plaza",
        address: "Naviglio Grande, Milan",
        priceLevel: 2,
        status: "abierto",
        longitude: 9.1745,
        latitude: 45.4509
    },
    {
        name: "Trattoria del Navigli",
        description:
            "Cocina lombarda junto al canal. Pedir el risotto alla milanese " +
            "y la cotoletta.",
        category: "Restaurante",
        address: "Naviglio Grande, Milan",
        priceLevel: 3,
        status: "abierto",
        longitude: 9.1738,
        latitude: 45.4515
    },

    // -------------------------------------------------------------- ROMA
    {
        name: "Colosseo",
        description:
            "El anfiteatro romano mas grande que se construyo. La entrada " +
            "incluye el Foro Romano y el Palatino.",
        category: "Monumento",
        address: "Piazza del Colosseo, Roma",
        priceLevel: 2,
        status: "abierto",
        longitude: 12.4922,
        latitude: 41.8902
    },
    {
        name: "Fontana di Trevi",
        description:
            "La fuente barroca mas conocida de Roma. La tradicion dice que hay " +
            "que lanzar una moneda con la mano derecha sobre el hombro izquierdo.",
        category: "Monumento",
        address: "Piazza di Trevi, Roma",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.4833,
        latitude: 41.9009
    },
    {
        name: "Pantheon",
        description:
            "Templo romano convertido en iglesia, con la cupula de concreto no " +
            "armado mas grande del mundo y un oculo abierto al cielo.",
        category: "Monumento",
        address: "Piazza della Rotonda, Roma",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.4769,
        latitude: 41.8986
    },
    {
        name: "Piazza Navona",
        description:
            "Plaza barroca con tres fuentes, la del centro de Bernini. " +
            "Esta rodeada de terrazas.",
        category: "Plaza",
        address: "Piazza Navona, Roma",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.4731,
        latitude: 41.8992
    },
    {
        name: "Gianicolo",
        description:
            "La terraza con la mejor vista de los techos de Roma. Se llega " +
            "caminando desde Trastevere y es el mejor lugar al atardecer.",
        category: "Mirador",
        address: "Piazzale Giuseppe Garibaldi, Roma",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.4617,
        latitude: 41.8919
    },
    {
        name: "Villa Borghese",
        description:
            "El parque grande de Roma, con lago, museos y miradores sobre " +
            "Piazza del Popolo.",
        category: "Parque",
        address: "Piazzale Napoleone I, Roma",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.4922,
        latitude: 41.9142
    },
    {
        name: "Osteria del Pantheon",
        description:
            "Cocina romana a dos calles del Pantheon. La carbonara y la " +
            "cacio e pepe son el motivo para entrar.",
        category: "Restaurante",
        address: "Via della Rotonda, Roma",
        priceLevel: 3,
        status: "abierto",
        longitude: 12.4775,
        latitude: 41.8979
    },
    {
        name: "Hotel Navona",
        description:
            "Hotel pequeno a pasos de Piazza Navona. Bien ubicado para " +
            "recorrer el centro a pie.",
        category: "Hotel",
        address: "Via dei Sediari, Roma",
        priceLevel: 3,
        status: "abierto",
        longitude: 12.4740,
        latitude: 41.8985
    },

    // ----------------------------------------------------------- VENECIA
    {
        name: "Piazza San Marco",
        description:
            "La plaza principal de Venecia, la unica que la ciudad llama " +
            "piazza. Se inunda con la acqua alta.",
        category: "Plaza",
        address: "Piazza San Marco, Venecia",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.3387,
        latitude: 45.4341
    },
    {
        name: "Basilica di San Marco",
        description:
            "Basilica bizantina cubierta de mosaicos de oro. La entrada a la " +
            "iglesia es rapida; subir al museo tiene cola aparte.",
        category: "Monumento",
        address: "Piazza San Marco, Venecia",
        priceLevel: 2,
        status: "abierto",
        longitude: 12.3397,
        latitude: 45.4345
    },
    {
        name: "Campanile di San Marco",
        description:
            "El campanario de la basilica. Tiene elevador y da la vista mas " +
            "alta sobre los techos y la laguna.",
        category: "Mirador",
        address: "Piazza San Marco, Venecia",
        priceLevel: 2,
        status: "abierto",
        longitude: 12.3390,
        latitude: 45.4340
    },
    {
        name: "Palazzo Ducale",
        description:
            "El palacio de los dogos, con el Puente de los Suspiros que lo " +
            "conecta con las antiguas prisiones.",
        category: "Museo",
        address: "Piazza San Marco, Venecia",
        priceLevel: 3,
        status: "abierto",
        longitude: 12.3400,
        latitude: 45.4337
    },
    {
        name: "Ponte di Rialto",
        description:
            "El puente mas antiguo sobre el Gran Canal. Al lado esta el " +
            "mercado de pescado, que abre temprano.",
        category: "Monumento",
        address: "Ponte di Rialto, Venecia",
        priceLevel: 1,
        status: "abierto",
        longitude: 12.3359,
        latitude: 45.4380
    },
    {
        name: "Bacaro di Rialto",
        description:
            "Bar de cicchetti junto al mercado. Se come de pie, con un " +
            "vaso de vino en la mano.",
        category: "Restaurante",
        address: "Campo San Giacomo, Venecia",
        priceLevel: 2,
        status: "abierto",
        longitude: 12.3352,
        latitude: 45.4375
    }
];

module.exports = locations;
