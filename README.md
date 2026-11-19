# RepairLoop

RepairLoop es una aplicación web para conectar usuarios que necesitan reparar equipos electrónicos con técnicos que ofrecen servicios de reparación.

El proyecto está dividido en una API desarrollada con Node.js y Express, y una interfaz web desarrollada con React y Vite. Firebase proporciona autenticación, perfiles y almacenamiento de datos en Firestore.

## Funciones principales

- Registro e inicio de sesión con Firebase.
- Roles `usuario` y `tecnico`.
- Perfil real obtenido desde la API.
- Registro y consulta de dispositivos por usuario.
- Creación y consulta de solicitudes de reparación.
- Perfil profesional de técnicos.
- Consulta de solicitudes abiertas para técnicos.
- Separación de permisos según el rol activo.

## Tecnologías

- Frontend: React, Vite y React Router.
- Backend: Node.js, Express y Firebase Admin.
- Base de datos: Cloud Firestore.
- Autenticación: Firebase Authentication.

## Requisitos

- Node.js y npm.
- Proyecto de Firebase.
- Credenciales de Firebase Admin configuradas mediante variables de entorno.
- Variables públicas de Firebase para el frontend.

## Configuración

Copia los archivos de ejemplo y completa sus valores:

```bash
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
```

No publiques `.env`, claves privadas ni credenciales reales en el repositorio.

La API usa `http://localhost:4000/api/v1` por defecto. El frontend puede apuntar a esta dirección mediante `VITE_API_URL`.

## Ejecución

Inicia la API:

```bash
cd apps/api
npm install
npm run dev
```

En otra terminal, inicia el frontend:

```bash
cd apps/web
npm install
npm run dev
```

Por defecto, el frontend estará disponible en `http://localhost:5173`.

## Autenticación y API

El frontend obtiene el token de Firebase del usuario autenticado y lo envía a las rutas protegidas con:

```http
Authorization: Bearer <id-token>
```

Las rutas principales incluyen perfiles, dispositivos, solicitudes y perfiles técnicos bajo el prefijo `/api/v1`.

## Comandos útiles

Frontend:

```bash
cd apps/web
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd apps/api
npm run dev
npm start
```

## Documentación

- [Historias de usuario](docs/historias-usuario.md)
- [Arquitectura](docs/arquitectura.md)


