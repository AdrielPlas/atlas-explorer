"use strict";

/**
 * Actividades del checklist, agrupadas por zona.
 *
 * El campo "zone" trae el nombre de la zona; el seed lo cambia por su
 * ObjectId al insertar. Una actividad no tiene coordenadas propias: se
 * activa cuando el usuario esta parado dentro del poligono de su zona.
 */
const activities = [
    // -------------------------------------------- Centro de Milan
    {
        title: "Subir a la terraza del Duomo",
        description: "Caminar entre las agujas de marmol con la ciudad abajo.",
        zone: "Centro de Milan",
        icon: "stairs",
        difficulty: "media"
    },
    {
        title: "Tomar un aperitivo en los Navigli",
        description: "Un spritz junto al canal antes de cenar, como se hace aqui.",
        zone: "Centro de Milan",
        icon: "glass",
        difficulty: "facil"
    },
    {
        title: "Ver La Ultima Cena",
        description:
            "Hay que reservar con semanas de anticipacion y la visita " +
            "dura solo 15 minutos.",
        zone: "Centro de Milan",
        icon: "painting",
        difficulty: "dificil"
    },
    {
        title: "Girar sobre el toro de la Galleria",
        description:
            "La tradicion dice que hay que girar tres veces con el talon " +
            "sobre el mosaico para tener suerte.",
        zone: "Centro de Milan",
        icon: "star",
        difficulty: "facil"
    },

    // ------------------------------------ Centro Historico de Roma
    {
        title: "Comer gelato cerca del Pantheon",
        description: "Pistacho y nocciola, en cono, caminando hacia la plaza.",
        zone: "Centro Historico de Roma",
        icon: "ice-cream",
        difficulty: "facil"
    },
    {
        title: "Lanzar una moneda en la Fontana di Trevi",
        description:
            "Mano derecha sobre el hombro izquierdo y de espaldas a la fuente, " +
            "para asegurar el regreso a Roma.",
        zone: "Centro Historico de Roma",
        icon: "coin",
        difficulty: "facil"
    },
    {
        title: "Comer una carbonara de verdad",
        description:
            "Guanciale, pecorino, huevo y pimienta. Sin crema: si la tiene, " +
            "no es carbonara.",
        zone: "Centro Historico de Roma",
        icon: "pasta",
        difficulty: "facil"
    },
    {
        title: "Ver el atardecer desde el Gianicolo",
        description:
            "Subir caminando desde Trastevere y llegar media hora antes de " +
            "que se meta el sol.",
        zone: "Centro Historico de Roma",
        icon: "sunset",
        difficulty: "media"
    },
    {
        title: "Meter la mano en la Bocca della Verita",
        description:
            "La leyenda dice que muerde la mano de quien miente. Esta en el " +
            "portico de Santa Maria in Cosmedin.",
        zone: "Centro Historico de Roma",
        icon: "hand",
        difficulty: "facil"
    },

    // ------------------------------- San Marco y Rialto, Venecia
    {
        title: "Subir al Campanile de San Marco",
        description: "Hay elevador. La vista cubre la plaza entera y la laguna.",
        zone: "San Marco y Rialto, Venecia",
        icon: "tower",
        difficulty: "facil"
    },
    {
        title: "Comer cicchetti de pie en un bacaro",
        description:
            "La version veneciana de las tapas, acompanada de una ombra " +
            "de vino. Se come en la barra.",
        zone: "San Marco y Rialto, Venecia",
        icon: "plate",
        difficulty: "facil"
    },
    {
        title: "Cruzar el Gran Canal en traghetto",
        description:
            "La gondola de los locales: cruza el canal por unos euros y " +
            "se hace de pie.",
        zone: "San Marco y Rialto, Venecia",
        icon: "boat",
        difficulty: "media"
    },
    {
        title: "Llegar al mercado de Rialto antes de las 8",
        description:
            "El mercado de pescado abre temprano y cierra a media manana. " +
            "Es la Venecia que trabaja.",
        zone: "San Marco y Rialto, Venecia",
        icon: "fish",
        difficulty: "dificil"
    },
    {
        title: "Perderse a proposito entre los callejones",
        description:
            "Guardar el telefono y caminar sin mapa hasta salir al Gran Canal. " +
            "Siempre se sale.",
        zone: "San Marco y Rialto, Venecia",
        icon: "compass",
        difficulty: "facil"
    }
];

module.exports = activities;
