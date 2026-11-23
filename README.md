# Atlas Explorer — paquete integrado

Este paquete reúne el frontend V4 y el backend V2 con la política de permisos por rol.

## Estructura

- `frontend/`: React + Vite + React Router + Leaflet.
- `backend/`: Node.js + Express + Mongoose + MongoDB Atlas.

## Requisitos

- Node.js 20 o superior.
- Una base de datos MongoDB Atlas.

## 1. Configurar y ejecutar el backend

En una terminal:

```bash
cd backend
npm install
```

Copia `.env.example` como `.env` y completa `MONGODB_URI` y `JWT_SECRET`. Para desarrollo local conserva `PORT=5000` y `FRONTEND_ORIGINS=http://localhost:5173`.

```bash
npm run seed
npm run dev
```

La API queda disponible en `http://localhost:5000/api`. Health check: `http://localhost:5000/api/health`.

## 2. Configurar y ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
```

Copia `.env.example` como `.env`. Para desarrollo local usa:

```env
VITE_API_URL=http://localhost:5000/api
```

Ejecuta:

```bash
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

## 3. Cuenta de demostración

El seed incluye las cuentas de demostración definidas en `backend/src/data/users.seed.js`. La cuenta administradora es `demo@turismo.com` y su contraseña de demostración es `demo12345`. Cambia o elimina estas credenciales antes de un despliegue público y no reutilices contraseñas reales.

## 4. Permisos

Consulta `backend/PERMISOS.md`. El backend es la autoridad; la interfaz solo oculta controles.

El contenido geográfico es colaborativo: cualquier usuario con sesión puede registrar ubicaciones, dibujar zonas y proponer actividades. Las reseñas y los photo spots solo los edita su autor (o un administrador, que modera). Lo único reservado al rol `admin` es el **catálogo de categorías**, porque es una lista global de la que dependen los filtros de todos.

El registro público crea las cuentas con rol `usuario`. Una cuenta recién creada puede usar todas las funciones principales de la aplicación.

## 5. Construcción

```bash
cd frontend
npm run build
```

El resultado de producción se genera en `frontend/dist`.

## Seguridad

- No subas `.env` al repositorio.
- Usa `.env.example` como plantilla sin secretos reales.
- Configura `FRONTEND_ORIGINS` con el dominio real del frontend al desplegar.
- Configura `VITE_API_URL` con la URL pública del backend al desplegar.

## Alcance funcional de aventura

El módulo `Mi aventura` del frontend corresponde al checklist y progreso personal de actividades. El backend de este paquete guarda el progreso de actividades por usuario; no incorpora una colección independiente para crear itinerarios/aventuras personalizadas.
