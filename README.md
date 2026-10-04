# Gua-iti Aventura Sin Límites

Plataforma web pública (venta/reservas) + sistema interno con roles para una empresa de turismo de aventura en San Gil, Santander, Colombia (cuevas y cuatrimotos).

Documento completo de requerimientos: `REQUERIMIENTOS_GUAITI.md`
Reglas del proyecto: `AGENTS.md`

## Stack

- **Backend:** Node.js + Express + Mongoose + MongoDB Atlas, JavaScript (ES modules), API REST en `/api/v1`
- **Frontend:** Vue 3 + Quasar (Vite) + Vue Router + Pinia, JavaScript
- **Auth:** JWT + bcrypt. Roles: `admin`, `secretario`, `guia`

## Estructura

```
Guaiti/
├── backend/
│   └── src/
│       ├── config/        # conexión a MongoDB
│       ├── models/        # modelos Mongoose
│       ├── controllers/   # un controlador por recurso
│       ├── routes/        # rutas /api/v1 + middlewares de rol
│       ├── middlewares/   # auth (JWT), permitirRoles, validación Joi, errores
│       ├── services/      # lógica de negocio
│       ├── seeds/         # seed:admin y seed de datos iniciales
│       └── utils/         # respuestas { ok, data, message }, paginación, esquemas
└── frontend/
    └── src/
        ├── pages/         # pantallas (login, guías, clientes, ...)
        ├── layouts/       # panel con menú lateral
        ├── stores/        # Pinia (autenticación)
        ├── services/      # axios con interceptor de token
        └── router/        # rutas con guard por rol
```

## Correr en local

Requisitos: Node 18+, MongoDB (local o Atlas).

```bash
# 1. Backend
cd backend
cp .env.example .env      # completa MONGODB_URI, JWT_SECRET y los datos del admin
npm install
npm run seed              # crea admin + guías + actividades + motos + parámetros + tarifas
npm run dev               # http://localhost:4000

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Usuarios de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| admin | `admin@guaiti.com` | `Guaiti2026*` |
| secretario | `secretaria@guaiti.com` | `Guaiti2026*` |
| guia | `guia@guaiti.com` | `Guaiti2026*` |

## Reglas clave

1. Todo el texto de la interfaz y los mensajes de error van en español.
2. **Ningún precio, tarifa o límite vive en el código**: todo está en MongoDB y se edita desde el panel (colecciones `actividades`, `tarifasPagoGuia`, `parametros`).
3. Los permisos se validan en el backend con middleware de roles.
4. Las contraseñas se guardan con bcrypt; los secretos van en `.env` (nunca en el código).
5. Un controlador por recurso; la lógica de negocio está en `src/services`.
6. Listados paginados y respuestas con formato `{ ok, data, message }`.
7. Cada registro guarda `createdBy`, `updatedBy` y timestamps.

## API (`/api/v1`)

| Método | Ruta | Roles |
| --- | --- | --- |
| POST | `/auth/login` | público |
| GET | `/auth/me` | autenticado |
| GET/POST/PUT | `/usuarios` | admin |
| GET/POST/PUT/DELETE | `/guias` | admin, secretario |
| GET/POST/PUT/DELETE | `/clientes` | admin, secretario |
| GET | `/actividades` | admin, secretario, guia |
| POST/PUT | `/actividades` | admin |
| GET | `/motos` | admin, secretario, guia |
| POST/PUT/PATCH | `/motos` | admin, secretario |
| GET/PUT | `/parametros` | admin, secretario |
| GET/POST/PUT/DELETE | `/tarifas-pago-guia` | admin |

## Despliegue en Render

El archivo `render.yaml` define los dos servicios:

1. **guaiti-api** (Web Service, carpeta `backend`): `npm install` → `npm start`, health check en `/api/v1/health`.
   Variables de entorno: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_CORREO`, `ADMIN_PASSWORD`, `NODE_ENV=production`.
2. **guaiti-web** (Static Site, carpeta `frontend`): `npm install && npm run build`, publica `frontend/dist`.
   Variable de entorno: `VITE_API_URL=https://guaiti-api.onrender.com/api/v1`.

Atlas debe permitir `0.0.0.0/0` en *Network Access* para que Render pueda conectarse.
