# Política de permisos de Atlas Explorer

La API aplica los permisos con `protect`, `restrictTo("admin")` y la regla de
propiedad `assertIsOwnerOrAdmin`. La interfaz también oculta los controles que
no corresponden, pero la autorización real siempre se valida en el servidor:
ocultar un botón no es seguridad, solo evita que el usuario pida algo que va a
ser rechazado.

## Criterio

Cualquier usuario con sesión puede **aportar** contenido: ubicaciones, zonas,
actividades, photo spots y reseñas. Eso es lo que hace útil la aplicación, y
permite que quien la revise con una cuenta recién creada use todas las
funciones.

Pero cada registro queda **a nombre de quien lo creó**, y solo esa persona
puede editarlo o eliminarlo. Así un usuario nunca altera ni borra el trabajo de
otro. El administrador sí puede modificar cualquier registro, porque su papel
es moderar.

El **catálogo de categorías** es la única excepción: está reservado al
administrador porque es una lista global. Si un usuario borrara "Monumento",
el filtro se rompería para todos.

| Recurso | Usuario | Administrador |
|---|---|---|
| Consultar todo | Sí | Sí |
| Crear ubicaciones, zonas y actividades | Sí | Sí |
| Editar o eliminar ubicaciones, zonas y actividades | **Solo las propias** | Todas (moderación) |
| Crear reseñas y photo spots | Sí | Sí |
| Editar o eliminar reseñas y photo spots | **Solo los propios** | Todos (moderación) |
| Completar y desmarcar actividades | Sí (su propia lista) | Sí |
| Crear, editar y eliminar **categorías** | **No** | Sí |

El registro público no permite elegir el rol: `AuthService.register` crea las
cuentas con el rol predeterminado `usuario`. El rol `admin` se asigna de forma
controlada en la base de datos.

## Cómo se aplica la regla de propiedad

En los servicios, antes de modificar o borrar:

```js
assertIsOwnerOrAdmin(location, user, "createdBy");
```

Esa función responde `401` si no hay sesión, deja pasar al administrador, y
responde `403` si el `createdBy` del registro no coincide con el usuario de la
sesión. Las reseñas usan el mismo mecanismo sobre su campo `author`.

La interfaz refleja exactamente la misma regla. En el mapa, en la tabla de
ubicaciones y en la lista de zonas, los botones de editar y eliminar solo se
dibujan para los registros propios; en los ajenos aparece la leyenda
"De otro viajero". Si las dos reglas no coincidieran, el usuario vería botones
que el servidor rechaza con `403`.

## Lo que protege el servicio, no el rol

- Eliminar una categoría en uso responde `409` en lugar de dejar ubicaciones
  apuntando a algo que ya no existe.
- Eliminar una ubicación arrastra sus reseñas y sus photo spots, porque sin ella
  no significan nada, e informa cuántos se eliminaron.
- Eliminar una zona arrastra sus actividades por la misma razón.
- Un usuario solo puede reseñar una vez cada ubicación (índice único sobre
  `location` y `author`).
- El arreglo `completedBy` de una actividad nunca sale en la respuesta: se
  devuelven `completed` (si la completé yo) y `completedCount`, para no exponer
  los identificadores de los demás usuarios.
