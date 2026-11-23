"use strict";

/**
 * Photo spots: el punto DESDE donde se toma la foto.
 *
 * El campo "subject" trae el nombre de la ubicacion que se fotografia; el
 * seed lo cambia por su ObjectId al insertar. Las coordenadas son las del
 * fotografo, no las del monumento, y por eso estan separadas de el: ahi
 * esta el sentido de la entidad.
 */
const photoSpots = [
    {
        title: "El Duomo desde la esquina de la Galleria",
        description:
            "Parandose en la esquina noreste de la plaza, la fachada entra " +
            "completa sin que estorbe la gente de la entrada principal.",
        subject: "Duomo di Milano",
        bestTime: "amanecer",
        longitude: 9.1912,
        latitude: 45.4650
    },
    {
        title: "Reflejo del Castello en el foso",
        description:
            "Desde el puente de acceso, el agua del foso refleja la torre " +
            "del Filarete. Funciona mejor sin viento.",
        subject: "Castello Sforzesco",
        bestTime: "atardecer",
        longitude: 9.1788,
        latitude: 45.4694
    },
    {
        title: "El Coliseo desde la Via Nicola Salvi",
        description:
            "Subiendo por la calle hacia el Parco del Colle Oppio se ve el " +
            "anfiteatro completo desde arriba, sin la reja del perimetro.",
        subject: "Colosseo",
        bestTime: "amanecer",
        longitude: 12.4905,
        latitude: 41.8915
    },
    {
        title: "Trevi sin gente desde el lado izquierdo",
        description:
            "Pegado al muro de la izquierda, en angulo, se saca la fuente " +
            "entera. A las seis de la manana esta practicamente vacia.",
        subject: "Fontana di Trevi",
        bestTime: "amanecer",
        longitude: 12.4829,
        latitude: 41.9006
    },
    {
        title: "Roma entera desde el Gianicolo",
        description:
            "La terraza da a los techos del centro con la cupula de San Pedro " +
            "a la derecha. Es la postal clasica de la ciudad.",
        subject: "Gianicolo",
        bestTime: "atardecer",
        longitude: 12.4620,
        latitude: 41.8921
    },
    {
        title: "San Marco desde el Campanile",
        description:
            "Desde arriba se ve la plaza completa con la laguna de fondo. " +
            "Hay que llegar antes de que cierre la ultima subida.",
        subject: "Campanile di San Marco",
        bestTime: "atardecer",
        longitude: 12.3390,
        latitude: 45.4340
    },
    {
        title: "Rialto desde el vaporetto",
        description:
            "Desde la linea 1 del vaporetto, el puente se ve de frente " +
            "sobre el Gran Canal. Conviene ir del lado derecho.",
        subject: "Ponte di Rialto",
        bestTime: "noche",
        longitude: 12.3370,
        latitude: 45.4372
    }
];

module.exports = photoSpots;
