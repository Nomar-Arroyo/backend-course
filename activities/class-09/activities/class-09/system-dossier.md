# System dossier

Un solo expediente para todo el análisis del taller. Regla de oro: cada
afirmación cita su evidencia (archivo y función, prueba, tabla o salida de
comando) o se declara como duda en la sección 9. "El service maneja la
lógica" sin nombres no cuenta como inventario.

## 1. How the system starts

* Comando de arranque: `npm start` → `node src/server.js` (y `npm run dev`
  → `node --watch src/server.js`) — `package.json:12-13`.
* Archivo que ejecuta Node: `src/server.js`. Importa la app desde
  `src/app.js`, lee `PORT` (por defecto `3000`) y abre el puerto con
  `app.listen(PORT)` — `src/server.js:4-7`. Es el ÚNICO archivo que
  escucha; `app.js` no abre puerto.
* Qué construye la aplicación: `src/app.js:23-41` crea `express()` y monta,
  en orden, CORS, request id, request logger, parser JSON, las rutas de
  health, el módulo `/auth`, el módulo `/requests` (detrás de
  `authenticate`) y, al final, `notFound` + `errorHandler`. Exporta `app`
  (`src/app.js:43`).
* Qué queda escuchando: el servidor HTTP de Node en `PORT`.
* La base no se abre al importar: `src/database/pool.js:14-16` crea el
  `Pool` de `pg` a partir de `DATABASE_URL` y falla temprano si falta
  (`src/database/pool.js:10-12`). Las migraciones y el seed son comandos
  aparte (`scripts/migrate.js`, `scripts/seed.js`).

## 2. Main components

| Componente | Archivo o recurso | Responsabilidad | Evidencia | Duda |
| --- | --- | --- | --- | --- |
| Punto de entrada | `src/server.js` | Iniciar el proceso y escuchar `PORT` | `src/server.js:4-7` | — |
| Construcción de la app | `src/app.js` | Crear la app Express y montar middlewares/routers en orden | `src/app.js:23-41` | — |
| Router principal | `src/routes/health.routes.js`, `src/modules/auth/auth.routes.js`, `src/modules/requests/requests.routes.js` | Traducir HTTP a llamadas del service | `src/modules/requests/requests.routes.js:23-52` | — |
| Módulos | `src/modules/requests/*`, `src/modules/auth/*`, `src/modules/users/*` | Dominios requests, auth y users | `src/modules/requests/requests.service.js:66-271` | — |
| Middleware global | `src/middleware/cors.js`, `request-id.js`, `request-logger.js`, `not-found.js`, `error-handler.js` | CORS, id de petición, log, 404 y errores | `src/app.js:25-41` | — |
| Autenticación | `src/middleware/authenticate.js` + `src/modules/auth/token.js` | Verificar el Bearer JWT y construir `req.auth` | `src/middleware/authenticate.js:13-45` | — |
| Autorización (policies) | `src/modules/requests/request.policy.js` | Decidir QUÉ puede hacer el actor (puro) | `src/modules/requests/request.policy.js:16-69` | — |
| Services | `src/modules/requests/requests.service.js`, `src/modules/auth/auth.service.js` | Reglas de caso de uso, units of work | `src/modules/requests/requests.service.js:86-93` | — |
| Stores / acceso a datos | `src/modules/requests/requests.store.js`, `src/modules/users/users.store.js` | SQL parametrizado que devuelve filas | `src/modules/requests/requests.store.js:20-130` | — |
| Conexión PostgreSQL | `src/database/pool.js`, `src/database/transaction.js` | Pool compartido y unidad de trabajo | `src/database/pool.js:14-24`, `src/database/transaction.js:6-22` | — |
| Manejo de errores | `src/app-error.js`, `src/middleware/error-handler.js` | Categoría → status y formato único | `src/middleware/error-handler.js:18-77` | — |
| Logging | `src/logging/logger.js`, `src/middleware/request-logger.js` | Una línea JSON por evento/petición | `src/logging/logger.js:9-25` | — |
| Health / readiness | `src/routes/health.routes.js` | `/health` (proceso) y `/ready` (base) | `src/routes/health.routes.js:20-46` | — |
| Pruebas | `test/*.test.js` + `test/helpers/*.js` | Suite con `node:test` + `supertest` | `package.json:14-26` | — |
| Scripts operativos | `scripts/check-environment.js`, `migrate.js`, `seed.js`, `validate-class-09.js` | Doctor, migraciones, seed y validador | `scripts/migrate.js:16-67` | — |
| Dependencias externas | `express`, `jose`, `pg`, `dotenv`; PostgreSQL (Supabase) | Framework, JWT, driver SQL, config | `package.json:29-37` | — |

## 3. Request trace

Recorrido completo de `GET /requests/:id` — en orden, con archivo y
función en cada paso:

1. Router: `src/modules/requests/requests.routes.js:28-31` — el handler
   `router.get('/:id', ...)` llama
   `getRequest(req.auth, parseIdParam(req.params.id))`.
2. Middlewares que atraviesa (orden real en `src/app.js:25-38`):
   `corsPolicy` (`src/middleware/cors.js:8-22`), `requestId`
   (`src/middleware/request-id.js:14-22`), `requestLogger`
   (`src/middleware/request-logger.js:13-38`), `express.json()`
   (`src/app.js:28`) y, para `/requests`, `authenticate`
   (`src/middleware/authenticate.js:13-45`). Si no hay token, el router
   NUNCA corre.
3. Dónde se valida el parámetro `id`: `src/http/parse-id.js:16-21`
   (`parseIdParam`), con el patrón `^[1-9][0-9]{0,17}$`. Un id inválido es
   un `AppError('contract', 'INVALID_REQUEST_ID')` → 400, antes de SQL.
4. Dónde nace la identidad autenticada:
   `src/middleware/authenticate.js:43` →
   `req.auth = { userId: payload.sub, role: payload.role }`, tras
   `verifyToken` (`src/modules/auth/token.js:35-41`).
5. Policy consultada (¿se consulta?): **NO en el detalle.**
   `getRequest` (`src/modules/requests/requests.service.js:86-93`) obtiene
   la fila y devuelve `mapRequestRow(row)` SIN llamar a `canViewRequest`;
   el comentario `TEMP(REQ-442)` (líneas 90-91) desactiva el chequeo. La
   asimetría: `getHistory` SÍ la consulta
   (`src/modules/requests/requests.service.js:224`) y `patchRequest`
   también (`src/modules/requests/requests.service.js:162`). **Esta es la
   causa raíz de BUG-901.**
6. Service: `src/modules/requests/requests.service.js:86-93`
   (`getRequest`), sin transacción (solo lectura).
7. Store y query: `src/modules/requests/requests.store.js:50-56`
   (`findById`) → `SELECT ... FROM requests WHERE id = $1` (parametrizada).
8. Transformación fila → JSON: `src/modules/requests/request.mapper.js:5-17`
   (`mapRequestRow`, snake_case → camelCase).
9. Respuesta y manejo de errores: `res.status(200).json(...)`
   (`src/modules/requests/requests.routes.js:30`); los errores suben a
   `src/middleware/error-handler.js:33-77`, que traduce la categoría de
   `AppError` a un status (ver sección 6).
10. Pruebas existentes que cubren este recorrido:
    `test/request-detail.test.js` (sin token 401, inexistente 404, owner
    200 y schema, agent 200), `test/request-access-policy.test.js` (la
    policy pura) y `test/regression.test.js` (vecinos: login, listado
    scopeado, claim). Las dos pruebas del caso "ajeno" estaban como
    `todo`, es decir, el hueco no estaba cubierto — parte del hallazgo.

## 4. Database inventory

Tablas principales (creadas por las migraciones en
`database/migrations/`, en orden lexicográfico):

* `users` — `001_create_users.sql`. PK `id UUID DEFAULT gen_random_uuid()`,
  `email` UNIQUE, `role` con `CHECK (role IN ('requester','agent'))` y
  `DEFAULT 'requester'`. `password_hash` NOT NULL.
* `requests` — `002_create_requests.sql`. PK `id BIGINT GENERATED ALWAYS AS
  IDENTITY`, FK `created_by → users(id) ON DELETE RESTRICT`, `status`
  DEFAULT `'open'`, `priority` DEFAULT `'medium'`. La migración `004`
  agrega `CHECK` de `priority` (`low/medium/high`) y de `status`
  (`open/in_progress/resolved/closed/cancelled`). La migración
  `005_add_request_assignment.sql` agrega `assigned_to UUID REFERENCES
  users(id)` (nullable = "nadie todavía"), sin romper filas existentes.
* `request_history` — `003_create_request_history.sql`. PK `id`, FK
  `request_id → requests(id)` y `changed_by → users(id)`, `CHECK` de `type`
  ampliado en `005` a `status_changed`/`priority_changed`/`request_claimed`
  (`004` valida además los valores de status/priority).
* `schema_migrations` — la crea el runner
  (`scripts/migrate.js:20-25`) como ledger (columna `name` PK).

Claves y restricciones relevantes: el FK `created_by` es la base del
ownership; los `CHECK` son la segunda defensa de los valores de dominio
(la primera está en el service, `assertValidPriority`).

Índices (`004` y `005`): `idx_requests_created_by`, `idx_requests_status`,
`idx_request_history_request_order (request_id, created_at, id)` y
`idx_requests_assigned_to`.

Cómo se versiona: `scripts/migrate.js:27-63` aplica cada `.sql` pendiente
en una transacción por migración y registra la fila del ledger DENTRO de
esa transacción; por eso correr `npm run db:migrate` dos veces es seguro
(las ya aplicadas salen `SKIPPED`).

Cómo se siembra: `scripts/seed.js:14-39` define tres usuarios
`*.seed@example.test` (dos requesters, un agente) y seis solicitudes con
su historia (15 eventos). Es repetible: borra SOLO las solicitudes de esos
usuarios y las recrea (`scripts/seed.js:64-72`); nunca hace `TRUNCATE`.

## 5. Authentication and authorization

* Dónde se verifica el JWT: `src/middleware/authenticate.js:28-40` exige
  el esquema `Bearer ` y delega en `verifyToken`
  (`src/modules/auth/token.js:35-41`), que valida firma, algoritmo,
  `iss`, `aud` y `exp` con `jose`.
* Qué contiene `req.auth`: `{ userId: payload.sub, role: payload.role }`
  (`src/middleware/authenticate.js:43`). Es la ÚNICA fuente de identidad
  confiable; el rol debe ser `requester` o `agent`
  (`src/middleware/authenticate.js:11,37`).
* Dónde viven las reglas de permiso:
  `src/modules/requests/request.policy.js`, funciones puras (sin Express,
  sin SQL). El comentario del archivo (`:6-14`) documenta la matriz de
  acceso del taller.
* Ejemplo de regla y su prueba: `canViewRequest`
  (`src/modules/requests/request.policy.js:20-23`) — un `agent` ve
  cualquiera; un `requester` solo si `request.createdBy ===
  actor.userId`. Su prueba vive en `test/request-access-policy.test.js`
  (se ejecuta sin Express ni base con `npm run test:policy`).
* Complemento: el login emite el token en
  `src/modules/auth/auth.service.js:110-114` y el hash de contraseña usa
  `scrypt` con sal aleatoria y comparación en tiempo constante
  (`src/modules/auth/password.js:21-59`).

## 6. Errors, logs and operational checks

* Formato de error y `requestId`: un solo traductor,
  `src/middleware/error-handler.js`. El cuerpo siempre es
  `{ error: { code, message }, requestId }` (`:29-31`) y la categoría de
  `AppError` decide el status (`:18-24`): `contract`→400, `auth`→401,
  `forbidden`→403, `resource`→404, `domain`→409. Los códigos de
  infraestructura (p. ej. `ENOTFOUND`) → 503 `DATABASE_UNAVAILABLE`
  (`:26-27,57-63`). El `requestId` nace en
  `src/middleware/request-id.js:14-22` y viaja también en la cabecera
  `X-Request-Id`.
* Qué se registra en logs y qué jamás: `src/middleware/request-logger.js`
  registra una línea por petición terminada con una lista blanca
  (`:21-32`): `requestId`, `method`, `path`, `status`, `durationMs` y,
  cuando hay autenticación, `userId`. NUNCA registra cabeceras, cuerpos,
  tokens ni query strings — lo que no está en la lista no llega al log.
  El detalle interno de un error inesperado (nombre, mensaje, stack) sí
  va al log, ligado por el mismo `requestId`
  (`src/middleware/error-handler.js:68-74`). `src/logging/logger.js:1-7`
  no lee el request, así que no puede filtrar nada por accidente.
* Diferencia entre `/health` y `/ready` (`src/routes/health.routes.js`):
  `/health` (`:27-29`) responde `{status:'ok'}` y NO toca PostgreSQL
  (liveness: el proceso vive); `/ready` (`:31-43`) ejecuta `SELECT 1` y
  responde `503 {database:'unavailable'}` si la base no responde
  (readiness: puede hacer trabajo útil). El chequeo es inyectable
  (`:20-23`) para probarlo sin credenciales reales.

## 7. Minimum-practices audit

Clasificaciones permitidas: COMPLIES · PARTIAL · DOES_NOT_COMPLY ·
NOT_FOUND · NOT_UNDERSTOOD. Cada fila cita evidencia o reconoce duda.

| Área | Pregunta | Clasificación | Evidencia / duda |
| --- | --- | --- | --- |
| Configuración | ¿Los secretos están fuera del código? | COMPLIES | `DATABASE_URL` y `JWT_SECRET` se leen de `process.env` con `dotenv` (`src/database/pool.js:10-16`, `src/modules/auth/token.js:8-12`); `.env` está ignorado por git y `token.js` falla al arrancar si falta el secreto. |
| Entrada | ¿Se validan datos externos? | COMPLIES | `parseIdParam` (`src/http/parse-id.js:14-21`), validación de body/priority (`src/modules/requests/requests.service.js:59-64`) y de email/password (`src/modules/auth/auth.service.js:40-68`). |
| SQL | ¿Las consultas están parametrizadas? | COMPLIES | Todas usan placeholders `$n` y los identificadores salen solo del archivo (`src/modules/requests/requests.store.js:43-46,51-54`, `src/modules/users/users.store.js:14-39`). |
| Identidad | ¿El JWT se verifica? | COMPLIES | `verifyToken` valida firma/alg/iss/aud/exp (`src/modules/auth/token.js:35-41`); `authenticate` exige `Bearer` (`src/middleware/authenticate.js:28-40`). |
| Permisos | ¿Existe autorización además de autenticación? | PARTIAL | Hay `request.policy.js` y se consulta en `getHistory`/`patchRequest`/`claimRequest`, pero NO en `getRequest` (`src/modules/requests/requests.service.js:86-93`): BUG-901. |
| Ownership | ¿Se limita el acceso al propietario cuando corresponde? | PARTIAL | La regla es correcta (`src/modules/requests/request.policy.js:20-23`) y el listado se scopea en SQL (`src/modules/requests/requests.store.js:37-40`), pero el detalle no la consulta → BUG-901. |
| Dominio | ¿Los campos del servidor están protegidos? | COMPLIES | `rejectServerControlledFields` y `SERVER_CONTROLLED_FIELDS` (`src/modules/requests/requests.service.js:35,47-54`) y `role` protegido en registro (`src/modules/auth/auth.service.js:18,56-63`). |
| Consistencia | ¿Las escrituras relacionadas usan transacción? | COMPLIES | `withTransaction` (`src/database/transaction.js:6-22`) envuelve `createRequest`, `patchRequest` y `claimRequest` (`src/modules/requests/requests.service.js:113-128,157-214,240-270`). |
| Errores | ¿Existe un formato consistente? | COMPLIES | Un único traductor (`src/middleware/error-handler.js:33-77`) y `notFound` tipado (`src/middleware/not-found.js:8-10`). |
| Logs | ¿Ayudan a investigar sin exponer secretos? | COMPLIES | Lista blanca de campos y `requestId` (`src/middleware/request-logger.js:21-32`); el logger no lee el request (`src/logging/logger.js:1-7`). |
| Pruebas | ¿Existen casos positivos y negativos? | PARTIAL | Hay 401/404/schema (`test/request-detail.test.js`) y scoping (`test/regression.test.js`), pero el caso del requester ajeno estaba como `todo`: el hueco no estaba cubierto. |
| Migraciones | ¿El esquema está versionado? | COMPLIES | `database/migrations/001..005` y ledger `schema_migrations` (`scripts/migrate.js:20-25`). |
| Seed | ¿Puede repetirse de forma controlada? | COMPLIES | `scripts/seed.js:64-72` borra solo los datos del seed y los recrea; nunca `TRUNCATE`. |
| Arquitectura | ¿HTTP, reglas y SQL están separados razonablemente? | COMPLIES | route → service → policy/store → mapper; la policy no importa Express ni SQL (lo verifica el check 12 del validador). |
| Operación | ¿Health y readiness tienen propósitos distintos? | COMPLIES | `/health` sin base y `/ready` con `SELECT 1` (`src/routes/health.routes.js:27-43`). |

## 8. Change impact

Completa ANTES de modificar código. Commit: `class-09-analysis`.

### Observable behavior

* **Cambia:** un `requester` que NO creó la solicitud obtiene `404` en
  `GET /requests/:id` (hoy obtiene `200` y el cuerpo con `createdBy`
  ajeno). Lo mismo si envía `?userId=`/`?createdBy=` con el id del dueño:
  sigue siendo `404`.
* **NO debe cambiar:** `owner` → `200` con el schema idéntico; `agent` →
  `200`; sin token → `401`; id inexistente → `404`; el listado scopeado,
  `patch`, `claim` e `history`.

Evidencia de la reproducción (salida real antes del fix, con usuarios y
solicitud sintéticas ya limpiadas):

```text
request id            : 316
owner    GET /:id     : 200
stranger GET /:id     : 200   (bug: debería ser 404)
no token GET /:id     : 401
stranger GET ?userId= : 200   (bug: debería ser 404)
stranger body.createdBy: 59c6af04-...  (dueño ajeno expuesto)
owner id (para comparar): 59c6af04-...
```

### Files likely affected

* Producción: `src/modules/requests/requests.service.js` — SOLO la función
  `getRequest` (`:86-93`). No tocar `request.policy.js` (ya es correcta),
  ni el store, ni el mapper, ni las rutas.
* Pruebas: `test/request-access-policy.test.js` y
  `test/request-detail.test.js` (convertir los `todo` en pruebas reales).
* No se toca el esquema: ninguna migración.

### Rule to protect

Un `requester` solo puede ver el detalle y el historial de las solicitudes
que él creó; un `agent` ve cualquiera; la identidad proviene únicamente
del token verificado.

### Data required

`actor.role` y `actor.userId` (de `req.auth`, ya disponible en
`getRequest`) y `request.createdBy` (de la fila leída). Todos presentes;
la regla no necesita ningún dato nuevo ni query adicional.

### Status codes

| Caso | Código / code |
| --- | --- |
| Sin token | `401` `AUTHENTICATION_REQUIRED` |
| `id` inválido (no entero positivo) | `400` `INVALID_REQUEST_ID` |
| `id` inexistente | `404` `REQUEST_NOT_FOUND` |
| Existente pero NO visible para el requester | `404` `REQUEST_NOT_FOUND` (decisión de ESTE sistema: indistinguible del inexistente para evitar enumeración) |
| Owner del recurso | `200` (schema sin cambios) |
| Agent | `200` |
| `?userId=`/`?createdBy=` ajenos | `404` (la identidad solo sale del token) |

### Tests to add or change

* `test/request-access-policy.test.js`: convertir los 3 `todo` (agent →
  `true`; owner → `true`; stranger → `false`). Corren sin Express ni base.
* `test/request-detail.test.js`: convertir los 2 `todo` — requester ajeno
  → `404` `REQUEST_NOT_FOUND`, y `?userId=<owner>` con token ajeno → `404`.
* Procedimiento: convertirlas PRIMERO y verlas fallar contra el bug (rojo)
  y pasar con el fix (verde).

### Behavior that must remain unchanged

El `200` del owner/agent con exactamente las 9 llaves del schema
(`assignedTo, createdAt, createdBy, description, id, priority, status,
title, updatedAt`), el `401` sin token, el `404` del id inexistente, el
scoping del listado por `created_by`, la acción `claim` y el historial.

### Risks

* Devolver `403` en vez de `404` rompería la decisión del sistema y
  confirmaría la existencia del recurso: se reutiliza el `notFound(id)`
  existente.
* Mapear la fila dos veces (`mapRequestRow`) para autorizar y luego
  responder: se mapea una sola vez y se devuelve ese mismo objeto.
* Consultar la policy con datos equivocados (p. ej. desde el body/query):
  el actor debe venir de `req.auth` y el recurso de la fila.
* Cambiar más de lo pedido (policy/store/migración) rompería los checks de
  "boundaries".

### Unknowns

* No está documentado por qué `getRequest` quedó sin el chequeo mientras
  `getHistory` sí lo tiene; el comentario `TEMP(REQ-442)` sugiere una
  desactivación temporal. Queda como pregunta (sección 9).
* No hay una regla escrita que diga si un `agent` debería poder ver TODA
  solicitud sin asignársela; la matriz del taller asume que sí.

## 9. Unknowns and questions

* ¿Por qué `getRequest` perdió el chequeo de visibilidad mientras
  `getHistory` (`src/modules/requests/requests.service.js:224`) y
  `patchRequest` lo conservan? El `TEMP(REQ-442)` parece deuda técnica,
  pero no hay ticket REQ-442 visible en el repo.
* ¿El `404` para "no visible" debería ser configurable por endpoint, o la
  decisión de "no confirmar existencia" aplica a todo el producto?
* `assigned_to` tiene FK a `users` pero nada garantiza en la base que sea
  un `agent` (lo advierte `005_add_request_assignment.sql:23-25`): la
  regla vive solo en la policy. ¿Es suficiente para este sistema?
* El log de cada petición incluye `userId` cuando hay autenticación
  (`src/middleware/request-logger.js:28`): ¿es aceptable exponerlo en el
  log operativo o debería ser un id opaco?
* No hay prueba de concurrencia para el `claim` (dos agentes a la vez,
  `src/modules/requests/requests.service.js:235-270`): ¿el `withTransaction`
  + estado de la fila basta, o hace falta `SELECT ... FOR UPDATE`?
* Un token válido de un usuario borrado responde `401`
  (`src/modules/auth/auth.service.js:117-122`): ¿qué pasa con los recursos
  que ese usuario creó (el FK `ON DELETE RESTRICT` los protege)?
