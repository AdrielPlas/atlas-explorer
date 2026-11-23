# Atlas Explorer — refinamiento V3

## Experiencia de ciudad
- Se incorpora una vista principal `/city` con escenario isométrico SVG interactivo.
- Los lugares obtenidos desde `/api/locations` se vinculan a hotspots seleccionables.
- La selección abre una ficha contextual con acceso al detalle y al mapa real.
- Se agregan filtros combinables de categorías (cliente) y zona (API), además de búsqueda.
- La ilustración se identifica como vista conceptual; no sustituye coordenadas ni cartografía real.

## Mapa real
- La vista `/map` conserva Leaflet + OpenStreetMap.
- La distribución ahora coloca resultados y filtros a la izquierda y el mapa amplio a la derecha.
- Seleccionar un lugar centra el mapa y permite abrir su ficha.
- Los administradores pueden crear, editar y eliminar ubicaciones.
- Se resalta el polígono de la zona seleccionada.

## Fichas y contenido
- Se reorganiza la ficha del destino con estado vacío para fotografías cuando la API no proporciona imágenes.
- Se integra mapa pequeño, photo spots y reseñas.
- La reseña propia se actualiza mediante PATCH para respetar la regla de una reseña por usuario y ubicación.

## Zonas
- Se agrega dibujo de polígonos mediante clics sobre Leaflet.
- Se permite deshacer puntos, limpiar el polígono, crear, editar y eliminar zonas.
- La conversión de coordenadas respeta GeoJSON `[longitud, latitud]` y Leaflet `[latitud, longitud]`.

## Catálogos
- El catálogo de categorías muestra iconos gráficos y ofrece un selector visual de iconos.
- Se conservan los permisos por rol del backend.

## Limitaciones conocidas
- El backend no expone imágenes/fotografías de ubicaciones en el modelo actual. Por eso la ficha muestra un estado vacío diseñado y no inventa fotografías.
- La ciudad isométrica es una representación conceptual interactiva. El mapa Leaflet conserva la ubicación geográfica exacta.
- No fue posible ejecutar `npm install`/`npm run build` en el entorno de generación porque no se pudo acceder al registro de npm. Se verificó la sintaxis JSX/JS con el compilador TypeScript; la compilación final debe comprobarse localmente después de instalar dependencias.
