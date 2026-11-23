# Política de permisos de Atlas Explorer

La API aplica los permisos con `protect` y `restrictTo("admin")`. La interfaz
también oculta controles según el rol, pero la autorización real siempre se
valida en el servidor.

## Criterio

El contenido geográfico es **colaborativo**: cualquier usuario con sesión puede
registrar ubicaciones, dibujar zonas y proponer actividades, igual que en
OpenStreetMap. Lo que escribe con voz propia (reseñas y photo spots) solo lo
modifica su autor. Y el **catálogo de categorías** es lo único reservado al
administrador, porque es una lista global: si un usuario borra "Monumento", el
filtro se rompe para todos.

| Recurso | Usuario | Administrador |
|---|---|---|
| Consultar todo | Sí | Sí |
| Crear, editar y eliminar ubicaciones | Sí | Sí |
| Crear, editar y eliminar zonas | Sí | Sí |
| Crear, editar y eliminar actividades | Sí | Sí |
| Completar y desmarcar actividades | Sí (su propia lista) | Sí |
| Crear reseñas y photo spots | Sí | Sí |
| Editar o eliminar reseñas y photo spots | Solo los propios | Todos (moderación) |
| Crear, editar y eliminar **categorías** | **No** | Sí |

El registro público no permite elegir el rol: `AuthService.register` crea las
cuentas con el rol predeterminado `usuario`. El rol `admin` se asigna de forma
controlada en la base de datos.

## Por qué no se restringen las ubicaciones ni las zonas

Las ubicaciones y las zonas son el núcleo de la aplicación. Si solo el
administrador pudiera crearlas, una cuenta recién registrada no podría usar lo
principal del sistema, y quien revise la aplicación creando su propia cuenta
vería la mitad de las funciones bloqueadas. Por eso la restricción por rol se
limita al catálogo.

La integridad no depende del rol, sino de las reglas del propio servicio:

- Eliminar una categoría en uso responde `409` en lugar de dejar ubicaciones
  apuntando a algo que ya no existe.
- Eliminar una ubicación arrastra sus reseñas y sus photo spots, porque sin ella
  no significan nada, e informa cuántos se eliminaron.
- Eliminar una zona arrastra sus actividades por la misma razón.
- Un usuario solo puede reseñar una vez cada ubicación (índice único sobre
  `location` y `author`).
