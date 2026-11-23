"use strict";

const AppError = require("./appError");

/**
 * Reglas de propiedad del contenido.
 *
 * Cualquier usuario con sesion puede APORTAR contenido: ubicaciones, zonas,
 * actividades, photo spots y resenas.
 *
 * Pero cada registro queda a nombre de quien lo creo, y solo esa persona
 * puede editarlo o borrarlo. El administrador puede moderar cualquiera.
 * Asi un usuario no puede alterar ni borrar el trabajo de otro.
 *
 * El unico catalogo cerrado es el de categorias, que se administra con
 * restrictTo("admin") en su router porque define la estructura del destino.
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
