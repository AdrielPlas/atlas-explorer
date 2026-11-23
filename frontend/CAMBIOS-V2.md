# Atlas Explorer — cambios V2

## Permisos
- Administrador: administra categorías, ubicaciones, zonas y actividades. Puede moderar reseñas y photo spots.
- Usuario: consulta catálogos, completa actividades, crea reseñas y photo spots, y solo modifica/elimina su propio contenido.
- El frontend oculta controles no permitidos y el backend rechaza operaciones no autorizadas.

## Correcciones incluidas
- Corregida la ruta de lectura de categorías (`/categories/usage`) separándola de la ruta CRUD (`/categories`).
- Checklist: interpreta la respuesta agrupada por zona de `GET /activities/my-checklist`.
- Los módulos de categorías y actividades quedan en modo consulta para usuarios.
- Photo spots y reseñas permiten creación para usuarios y edición/eliminación solo de contenido propio.
- La administración de ubicaciones y zonas se muestra solo a administradores.
- Se fija `@vitejs/plugin-react` en una versión compatible con Vite 6 para evitar el conflicto ERESOLVE anterior.

## Actualización local
1. Haz una copia de seguridad de tus carpetas actuales.
2. Reemplaza los archivos de código por los de esta entrega.
3. Conserva tus archivos `.env` actuales; no están incluidos en los ZIP.
4. En frontend ejecuta `npm install` y después `npm run dev`.
5. En backend ejecuta `npm install` y después `npm run dev`.

No se incluye `node_modules` ni credenciales.
