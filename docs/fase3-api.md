# Contrato API — Fase 3 (Campo y administración)

Documento de referencia para backend y frontend. Reglas generales en `AGENTS.md`.

## Reglas transversales

- Respuesta siempre `{ ok, data, message }`. Listados: `data = { items, total, pagina, limite, paginas }`.
- **Ningún precio/tarifa/límite en el código**: todo sale de `actividades`, `parametros`, `tarifasPagoGuia`.
- Todos los endpoints requieren `Authorization: Bearer <token>` salvo `/auth/login`.
- Un guía **solo ve lo suyo**: si `req.usuario.rol === 'guia'`, el backend resuelve la ficha `Guia` con `Guia.usuarioId = req.usuario._id` y filtra por `guiaId`. Si el usuario guía no tiene ficha de guía vinculada → 400 "Su usuario no está vinculado a una ficha de guía".
- Validación con Joi. Paginación `?page=&limit=`. `createdBy/updatedBy` + timestamps en todos los modelos.
- Parámetros relevantes (colección `parametros`): `maxMotosPorGuia`, `maxPersonasPorMoto`.

## Modelos nuevos

| Modelo | Campos |
| --- | --- |
| `Salida` | guiaId (ref Guia, req), fecha (Date, req), actividadId (ref Actividad, req), personas (Number, req), motos [ref Moto], cascos [ref CascoCueva], estado `abierta\|en_curso\|cerrada` (default abierta), novedades (String), excepcionMotos (Boolean, default false), liquidacionId (ref LiquidacionGuia, default null), createdBy/updatedBy, timestamps |
| `CascoCueva` | numero (Number, único, req), estado `disponible\|en_uso\|por_lavar\|danado\|perdido` (default disponible), createdBy/updatedBy, timestamps |
| `Adelanto` | guiaId (ref Guia, req), monto (Number >0, req), motivo (String, req), estado `solicitado\|aprobado\|rechazado\|descontado` (default solicitado), liquidacionId (ref, default null), aprobadoPor (ref Usuario), createdBy/updatedBy, timestamps |
| `BitacoraMoto` | salidaId (ref Salida, req), motoId (ref Moto, req), guiaId (ref Guia, req), fecha (Date, req), lavada/revisada/tanqueada/conGasolina/conAceite (Boolean, default false), observaciones (String), índice único `(salidaId, motoId)`, createdBy/updatedBy, timestamps |
| `ReporteDanio` | fecha (Date, req), motoId (ref Moto, opcional), equipo (String, opcional), guiaId (ref Guia, req), descripcion (req), fotos [String] (URLs), gravedad `leve\|grave` (default leve), estado `reportado\|en_reparacion\|resuelto` (default reportado), createdBy/updatedBy, timestamps |
| `Gasto` | fecha (Date, req), tipo `implementos\|baterias\|combustible\|repuestos\|otros` (req), valor (Number ≥0, req), descripcion (String), fotoSoporte (String URL), registradoPor (ref Usuario, req), createdBy/updatedBy, timestamps |
| `LiquidacionGuia` | guiaId (ref Guia, req), periodo { desde (Date), hasta (Date) }, salidas [ref Salida], adelantos [ref Adelanto], adelantosDescontados (Number), descuentosPorPerdidas (Number, default 0), total (Number), fechaPago (Date, default null), estado `pendiente\|pagada` (default pendiente), createdBy/updatedBy, timestamps |

## Endpoints

### Panel del guía (3.1)
- `GET /api/v1/panel-guia?fecha=YYYY-MM-DD` → roles `guia`
  `data = { fecha, guia: {id,nombre}, salidas: [Salida poblada con actividad y motos/cascos], totalAdelantosPendientes, totalLiquidacionesPendientes, cascosPendientes: Number }`
  `totalAdelantosPendientes` = suma de adelantos con estado `aprobado` y `liquidacionId: null` (lo que se le debe descontar).

### Cascos (3.2)
- `GET /cascos?estado=&q=` (admin, secretario, guia) paginado → items `{_id, numero, estado}`
- `POST /cascos {numero, estado?}` (solo admin) · `PUT /cascos/:id` (admin) · `DELETE /cascos/:id` (admin, borra solo si `disponible`)
- `PUT /cascos/rango {desde, hasta}` (solo admin) → crea/actualiza cascos de `desde` a `hasta` (seed 1–60, rango editable desde el panel). También acepta `hasta` menor que `desde` para eliminar cascos por encima (solo si están `disponible`).

### Salidas (3.2)
- `GET /salidas?fecha=&guiaId=&estado=&page=&limit=` → guia: solo suyas; secretario/admin: todas (filtro `guiaId` opcional). Poblado: `actividadId` (nombre, precioPorPersona, tipoRecurso), `motos` (nombre, estado), `cascos` (numero, estado), `guiaId` (nombre).
- `GET /salidas/:id`
- `POST /salidas {fecha, actividadId, personas, motos: [motoId], cascos: [cascoId], novedades?, excepcionMotos?}` → roles `guia` (y admin).
  Validaciones (mensaje en español, 400/409):
  1. actividad existe y está activa.
  2. cada moto existe, `estado === 'disponible'` → si no: `La moto "X" está en mantenimiento y no puede salir`.
  3. ninguna moto ya asignada a otra salida con estado `abierta` o `en_curso` → `La moto "X" ya está en una salida abierta`.
  4. ídem cascos: solo `disponible` y no en otra salida abierta → `El casco N ya está en una salida abierta`.
  5. `personas <= motos.length * maxPersonasPorMoto` (parámetro) → `Con X motos solo pueden ir Y personas`.
  6. `motos.length <= maxMotosPorGuia` (parámetro); si se supera y `excepcionMotos !== true` → 400 `Máximo Z motos por guía. Pida autorización al administrador`. Si `excepcionMotos === true` y el rol es `admin` o `secretario`, se permite y se guarda `excepcionMotos: true` (si lo manda un guía → 403 `Solo el administrador o el secretario pueden autorizar la excepción de motos`).
  7. si `tipoRecurso === 'moto'` debe traer al menos 1 moto; si es `cupo` (cuevas) debe traer al menos 1 casco.
  Al crear: cascos pasan a `en_uso`; respuesta con la salida poblada. Estado inicial `abierta`.
- `PATCH /salidas/:id/estado {estado: 'en_curso'|'cerrada', novedades?, cascosEstado: [{cascoId, estado}]}` → guia (solo la suya) o admin.
  - `en_curso`: solo cambia el estado.
  - `cerrada`: valida que `cascosEstado` cubra todos los cascos de la salida (los no indicados vuelven a `disponible`); estados permitidos allí: `disponible|por_lavar|danado|perdido`. Libera todo (motos quedan con su estado actual; cascos según lo marcado). Registra `novedades`.
- `PUT /salidas/:id/excepcion {excepcionMotos: true}` → admin, secretario (autoriza una salida existente).

### Adelantos (3.3)
- `GET /adelantos?estado=&guiaId=` → guia: solo suyos; admin/secretario: todos.
- `POST /adelantos {monto, motivo, fecha?}` → solo `guia` (el propio; `guiaId` se toma del token).
- `PATCH /adelantos/:id/estado {estado: 'aprobado'|'rechazado'}` → admin, secretario. Al aprobar guarda `aprobadoPor`.
- (Los estados `descontado` los pone el cálculo de liquidación, no el usuario.)

### Bitácora (3.4)
- `GET /bitacora?fecha=&motoId=&guiaId=&salidaId=` → guia (solo suyas), secretario, admin. Paginado. Poblado: moto (nombre), guia (nombre), salida (fecha).
- `POST /bitacora {salidaId, motoId, fecha, lavada, revisada, tanqueada, conGasolina, conAceite, observaciones}` → guia, secretario, admin.
  - valida que la salida pertenezca al guía (si el rol es guia), que la moto pertenezca a esa salida, y unicidad `(salidaId, motoId)` → 409 `Ya existe la bitácora de esa moto para esa salida`.
- `PUT /bitacora/:id` → guia (solo la suya), secretario, admin.

### Fotos (3.5)
- `POST /uploads/foto` → campo multipart `archivo` (imagen jpg/png/webp, máx 8 MB) → roles guia, secretario, admin.
  - Si `CLOUDINARY_*` está en el `.env`: sube con `cloudinary.uploader.upload_stream` usando transformación `{ width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }` y devuelve `{ url }`.
  - Si no hay credenciales: guarda en `backend/uploads/` (crea la carpeta, `express.static` montada en `/uploads`) y devuelve `{ url: '/uploads/xxx.jpg' }`.
  - Si el archivo no es imagen → 400 `Solo se pueden subir imágenes`.

### Reportes de daño (3.5)
- `GET /reportes-danio?estado=&motoId=&guiaId=&fecha=&page=` → guia, secretario, admin (guia solo los suyos).
- `POST /reportes-danio` (multipart `fotos[]` múltiples **o** JSON con `fotos: [url]`) `{fecha, motoId?|equipo?, descripcion, gravedad}` → guia, secretario, admin. `guiaId` = del token.
  - Si `gravedad === 'grave'` y hay `motoId`: la moto pasa a `estado: 'mantenimiento'` y se responde `motoEnMantenimiento: true`.
- `PATCH /reportes-danio/:id/estado {estado}` → admin, secretario.

### Gastos (3.5)
- `GET /gastos?tipo=&fechaDesde=&fechaHansta=&page=` → guia, secretario, admin.
- `POST /gastos` multipart (`fotoSoporte` opcional) o JSON `{fecha, tipo, valor, descripcion}` → guia, secretario, admin (`registradoPor` = token).
- `PUT /gastos/:id` → admin, secretario.
- `DELETE /gastos/:id` → admin.

### Liquidaciones (3.6)
- `GET /liquidaciones?guiaId=&estado=&periodo=` → guia: solo suyas; secretario/admin: todas (poblado guia + salidas + adelantos).
- `POST /liquidaciones {guiaId, periodo: {desde, hasta}, salidasIds: [], descuentosPorPerdidas?, fechaPago?}` → admin, secretario.
  Cálculo (todo desde la BD):
  1. Salidas válidas: del guía, estado `cerrada`, `liquidacionId: null`, dentro del periodo si se envía.
  2. `base = Σ (salida.personas × actividad.precioPorPersona)` para cada salida seleccionada.
  3. `adelantos` = adelantos del guía con estado `aprobado` y `liquidacionId: null` → `adelantosDescontados = Σ monto`.
  4. `total = base − adelantosDescontados − descuentosPorPerdidas` (nunca negativo: si baja de 0, responde 400 `El total no puede ser negativo`).
  5. Marca las salidas con `liquidacionId`, los adelantos con estado `descontado` + `liquidacionId`.
  6. `fechaPago` presente ⇒ estado `pagada`.
- `PATCH /liquidaciones/:id/estado {estado: 'pagada', fechaPago?}` → admin, secretario.
- `GET /liquidaciones/resumen/:guiaId` → guia (las suyas), admin, secretario: `{salidasPendientes: [{_id, fecha, personas, valor}], adelantosAprobados: [...], base, adelantosDescontados}` (previsualización para armar la liquidación).

## Matriz de roles (resumen)

| Recurso | guia | secretario | admin |
| --- | --- | --- | --- |
| panel-guia | ✅ (solo suyo) | ❌ | ❌ |
| salidas (leer) | ✅ suyas | ✅ todas | ✅ todas |
| salidas (crear/cerrar) | ✅ | ❌ (solo consulta) | ✅ |
| salidas excepción motos | ❌ | ✅ | ✅ |
| cascos | ✅ leer | ✅ leer | ✅ CRUD + rango |
| adelantos | ✅ crear/leer suyos | ✅ leer todos, aprobar/rechazar | ✅ |
| bitácora | ✅ crear/leer suyas | ✅ | ✅ |
| reportes-daño | ✅ crear/leer suyos | ✅ + cambiar estado | ✅ |
| gastos | ✅ crear/leer | ✅ crear/editar/leer | ✅ CRUD |
| liquidaciones | ✅ leer suyas | ✅ | ✅ |

## Frontend (rutas nuevas)

- `/panel` — Panel del guía (mobile-first): salidas de hoy, botón **Iniciar salida**, lo que se le debe, liquidaciones. Es el inicio del rol `guia` (redirect de `/` para guía).
- `/salidas` — lista + diálogo Iniciar salida (actividad, personas, selección de motos por nombre y cascos por número con campo "rango o sueltos") + acción Cerrar salida (marca cascos: por lavar / dañados / perdidos) + novedades.
- `/adelantos` — guía: solicita (monto + motivo) y ve los suyos; admin/secretario: aprueban/rechazan.
- `/bitacora` — formulario por salida/moto con checkboxes (lavada, revisada, tanqueada, conGasolina, conAceite) + filtros fecha/moto/guía.
- `/danos` — reportes con cámara (`<input type="file" accept="image/*" capture="environment" multiple>`), gravedad y estados.
- `/gastos` — registro con foto de soporte, filtros por tipo y fecha.
- `/liquidaciones` — admin/secretario: arma liquidación (selecciona guianzas del guía, ve adelantos, descuentos, total). Guía: consulta las suyas.
- Menú lateral: guía ve Panel, Salidas, Adelantos, Bitácora, Daños, Gastos, Liquidaciones, Actividades, Motos. Secretario/admin agregan lo suyo (Cascos dentro de Configuración o su propia pantalla).

Alertas/confirmaciones con **SweetAlert2** (tema oscuro, colores de marca) y animaciones de entrada con **GSAP**. Notificaciones del interceptor de `api.js` pasan a SweetAlert2.
