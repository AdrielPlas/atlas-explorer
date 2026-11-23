# Despliegue en Netlify

Un solo sitio de Netlify sirve el frontend y el backend. El frontend se
publica como sitio estático y el backend corre como **función serverless**
en `/.netlify/functions/api`; la regla de `netlify.toml` conecta `/api/*`
con esa función.

La ventaja de tenerlo todo en un dominio es que el navegador no considera las
peticiones como "de otro origen": no hay que configurar CORS, no hay que
acertarle a `FRONTEND_ORIGINS`, y queda **una sola liga** que entregar.

## Qué cambia respecto a correrlo localmente

Netlify no mantiene un servidor encendido: ejecuta una función que arranca
cuando llega una petición y se apaga después. Eso obliga a dos adaptaciones,
que ya están resueltas en `netlify/functions/api.js`:

1. **No se llama a `app.listen()`.** La función importa `backend/src/app.js`
   (la aplicación de Express) y la envuelve con `serverless-http`.
   `backend/src/index.js` sigue existiendo para desarrollo local.

2. **La conexión a MongoDB se reutiliza.** Si se conectara en cada petición,
   cada invocación abriría una conexión nueva contra Atlas hasta agotar el
   límite del cluster. La promesa de conexión se guarda en una variable del
   módulo, que Node conserva entre invocaciones de la misma instancia.

## 1. MongoDB Atlas

En **Network Access**, agregar `0.0.0.0/0` (acceso desde cualquier IP).

Las funciones de Netlify no tienen una IP fija que se pueda poner en la lista,
así que restringir por IP no es opción. La seguridad queda en el usuario y la
contraseña de la base, que viven en las variables de entorno y nunca en el
repositorio.

## 2. Crear el sitio

En Netlify: **Add new site → Import an existing project**, conectar el
repositorio y elegir la rama.

Netlify lee `netlify.toml`, así que la configuración de build ya viene puesta:

| Campo | Valor |
|---|---|
| Base directory | *(vacío: la raíz del repositorio)* |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |
| Functions directory | `netlify/functions` |

## 3. Variables de entorno

En **Site configuration → Environment variables**:

| Variable | Valor |
|---|---|
| `MONGODB_URI` | la cadena de conexión de Atlas, con usuario y contraseña reales |
| `JWT_SECRET` | una cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | `7d` |

Para generar el secreto:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`PORT` y `FRONTEND_ORIGINS` **no hacen falta** en Netlify: el puerto lo maneja
la plataforma y, al compartir dominio, no hay petición entre orígenes
distintos.

## 4. Cargar los datos

El seed se corre **desde una computadora**, no desde Netlify: es un script de
una sola vez, no parte del sitio.

```bash
cd backend
# .env local, apuntando al MISMO Atlas que usa Netlify
npm install
npm run seed
```

Inserta 3 usuarios, 7 categorías, 3 zonas, 20 ubicaciones, 7 photo spots,
14 actividades y 11 reseñas.

## 5. Comprobar que subió bien

En este orden, porque cada paso descarta una causa distinta:

```
https://<tu-sitio>.netlify.app/api/health
```

Debe responder `{"status":"ok", ...}`. Esta ruta **no consulta la base**, a
propósito: si responde, el backend subió y la función corre. Si falla, el
problema es del despliegue, no de MongoDB.

```
https://<tu-sitio>.netlify.app/api/locations
```

Debe responder `count: 20`. Aquí sí entra MongoDB. Si `/api/health` funciona
pero esta da `503`, el problema es la conexión: revisar `MONGODB_URI` y que
Atlas tenga `0.0.0.0/0` en Network Access.

```
https://<tu-sitio>.netlify.app/
```

La aplicación. Entrar con `demo@turismo.com` / `demo12345`.

## Lo que hay que saber si preguntan

**La primera petición después de un rato tarda más.** Si nadie usa el sitio,
Netlify apaga la función; la siguiente petición tiene que arrancarla y volver
a conectar con Atlas. Son unos segundos, y solo la primera vez. Conviene abrir
el sitio unos minutos antes de la revisión para que ya esté despierta.

**El límite de la función son 10 segundos.** Por eso el tiempo de espera de
MongoDB está en 8 segundos en `api.js`: si la base no responde, la función
alcanza a devolver un `503` con un mensaje claro en lugar de que Netlify corte
la petición con un error genérico.

**Por qué `0.0.0.0/0` en Atlas.** No es descuido: las funciones serverless no
tienen IP fija. El control de acceso está en las credenciales.

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `/api/health` da 404 | la regla de redirección no se aplicó | revisar que `netlify.toml` esté en la raíz del repositorio |
| `/api/health` responde pero `/api/locations` da 503 | no conecta a Atlas | revisar `MONGODB_URI` y Network Access |
| Entrar a `/map` da 404 al recargar | falta el comodín del SPA | ya está en `netlify.toml`: la regla `/*` → `/index.html` |
| La app carga pero el login da `ERR_CONNECTION_REFUSED` a `localhost:5000` | el build no tuvo `VITE_API_URL` | ya está en `[build.environment]` de `netlify.toml`; hay que **volver a desplegar**, porque Vite la inserta al compilar |
| `count: 0` en todo | falta correr el seed | `npm run seed` apuntando al mismo Atlas |
