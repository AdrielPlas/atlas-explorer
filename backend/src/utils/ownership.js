"use strict";

const AppError = require("./appError");

/**
 * Reglas de propiedad del contenido.
 *
 * El catalogo (categorias, ubicaciones, zonas y actividades) es colaborativo:
 * cualquier usuario con sesion puede completarlo y corregirlo, igual que en
 * OpenStreetMap o Wikipedia.
 *
 * El contenido con voz propia (resenas y photo spots) solo lo puede
 * modificar quien lo escribio, o un administrador.
 */
function assertIsOwnerOrAdmin(document, user, campo = "createdBy") {
    if (!user) {
        throw new AppError(401, "Necesitas iniciar sesion para hacer esto.");
    }

    if (user.role === "admin") {
        return; // Los administradores pueden moderar cualquier contenido
    }

    // El campo puede venir como ObjectId o ya poblado como documento
    const referencia = document[campo];
    const ownerId = referencia?._id
        ? referencia._id.toString()
        : String(referencia);

    if (ownerId !== user.id) {
        throw new AppError(403, "Solo puedes modificar el contenido que tu creaste.");
    }
}

module.exports = {
    assertIsOwnerOrAdmin
};
