# Atlas Explorer — Frontend

Aplicación web turística interactiva con ciudad isométrica, exploración geográfica y experiencia gamificada.

## Requisitos
- Node.js 20 o superior recomendado
- Backend Atlas Explorer ejecutándose en `http://localhost:5000`

## Instalación
```bash
npm install
```

Copia `.env.example` a `.env` y verifica `VITE_API_URL=http://localhost:5000/api`.

## Desarrollo
```bash
npm run dev
```

## Producción
```bash
npm run build
```

## Navegación
- `/city`: ciudad isométrica interactiva y exploración por categorías y zonas.
- `/map`: mapa real Leaflet + OpenStreetMap, resultados y registro de ubicaciones para administradores.
- `/location/:id`: ficha turística con reseñas, photo spots y mapa de detalle.
- `/checklist`: aventura y progreso personal.
- `/categories`, `/activities`, `/photo-spots`, `/reviews`, `/zones`: módulos de catálogo y administración.

## Roles
- `admin`: administra categorías, ubicaciones, zonas y actividades. Puede moderar reseñas y photo spots.
- `usuario`: consulta catálogos, completa actividades, crea reseñas y photo spots, y solo puede editar/eliminar su propio contenido.

La autorización real se valida en el backend. Los controles ocultos en la interfaz no sustituyen la seguridad de la API.

## Notas de implementación
- La ciudad isométrica es una representación ilustrativa e interactiva; las fichas y el mapa real usan los registros y coordenadas del backend.
- Leaflet usa coordenadas `[latitud, longitud]`; GeoJSON conserva `[longitud, latitud]`.
- Las imágenes de destinos no se inventan: si la API no proporciona fotografía, se muestra un estado vacío diseñado.
