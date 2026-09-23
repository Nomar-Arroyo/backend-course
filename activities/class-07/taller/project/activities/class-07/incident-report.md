# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

`npm run class-07:doctor` → **Environment ready for incident response.** los 7 checks en PASS (entorno, conexión a la base, migraciones, seed, app, test runner, fixtures de incidentes).
`npm run db:migrate` (dos veces) → sin pendientes; las migraciones 001-004 ya estaban aplicadas de la clase 06 y el seed estaba presente (heredado del taller anterior).
`npm test` → **20 pass / 17 todo.** Los 20 existentes protegen el contrato de las clases 3-6; los 17 `todo` son los stubs que hay que convertir en pruebas reales mientras se resuelven los incidentes.
`npm run incidents:reproduce` reprodujo los tres incidentes antes de tocar código: INC-701 → 500, INC-702 → 500, OPS-703 → header/body sin requestId.

## Incident 701

### Report

"Some request identifiers return an internal server error." Un integrador arma enlaces hacia solicitudes y algunos devuelven 500; "a veces funciona y a veces no".

### Reproduction

`GET /requests/not-a-number` con token válido de cualquier usuario (`ana.requester.seed@example.test`).

### Expected result

`400` con `error.code === "INVALID_REQUEST_ID"` y mensaje "Request id must be a positive integer." El valor debe rechazarse: texto, decimales, cero, negativos y `12abc`; un id bien formado pero inexistente sigue siendo `404`.

### Actual result

`500 Internal Server Error`. El terminal del servidor mostraba el error técnico de PostgreSQL: mensaje de sintaxis inválida para `bigint` al pasar `NaN` a la consulta.

### Hypotheses

1. **El `Number(...)` de la ruta convierte el id en `NaN` antes de llegar al SQL** (alta probabilidad; ya se ve línea `Number(req.params.id)`). Cómo comprobarlo: leer `requests.routes.js` y rastrear el valor en `findById`, o temporalmente imprimir el valor que llega a `requests.store.js`. Un `NaN` pasado con parámetro `$1::bigint` es precisamente el error de PostgreSQL observado.
2. **El tipo de columna/`::bigint` en la consulta explota el mal formato** (misma causa de base, otra zona del stack). Cómo comprobarlo: ver las migraciones 002/004 (columna `id`) y si el error cambia al probar `12abc` — `parseInt('12abc')` devolvería `12` y funcionaría, lo que confirmaría que el formato se valida tarde o nunca.
3. **Hay un `parseInt` caprichoso en algún punto** que "arregla" algunos valores. Cómo comprobarlo: buscar `parseInt`/`Number`/`parseFloat` en `src/` — explicaría el "a veces funciona".

### Evidence

- Salida de reproducción: `[INC-701] Actual: 500 INTERNAL_ERROR`.
- El valor llega a la base como `NaN`: `requests.routes.js` hacía `Number(req.params.id)` y `requests.store.js` lo pasaba directo a `WHERE id = $1`. PostgreSQL no puede comparar `bigint` con `NaN` y responde con su error técnico.
- El texto del error técnico aparecía en el terminal (no se reproduce aquí para no copiar internals; se confirmó leyendo la salida del server).

### Confirmed cause

La conversión prematura con `Number(req.params.id)` en las rutas `GET /:id`, `GET /:id/history` y `PATCH /:id` produce `NaN` para formatos no numéricos. Ese `NaN` se enviaba como parámetro `bigint` a PostgreSQL, que responde 500 en lugar de un 400 de contrato. La aplicación no validaba el formato antes de ejecutar SQL.

### Correction

En `src/modules/requests/requests.service.js` se agregó `parseRequestId(value)` que valida la cadena COMPLETA con `/^\d+$/` y descarta el cero (`Number(value) === 0`), lanzando `AppError('contract', 'INVALID_REQUEST_ID', 'Request id must be a positive integer.')` ANTES de cualquier consulta. Las rutas ahora pasan `req.params.id` crudo al service (ya no `Number(...)`), de modo que el formato se valida como lo envió el cliente y el SQL nunca se ejecuta con un valor inválido.

### Regression test

`test/errors.test.js`:
- "an alphabetic id answers 400 INVALID_REQUEST_ID, not 500".
- "decimal, zero and negative ids are rejected the same way" (`1.5`, `0`, `-3`, `12abc`).
- "a well-formed id that matches nothing still answers 404" (`999999999`) — pines que la corrección no convierte el 404 en 400.

Sin el fix: los tres devuelven 500 (o el tercero seguiría 500 por el `NaN`). Con el fix: 400/400/404.

## Incident 702

### Report

"Updating some priorities produces an internal server error." Un agente marcó una solicitud como `critical` desde una herramienta externa y recibió 500 sin más explicación.

### Reproduction

`PATCH /requests/:id` con `{ "priority": "critical" }`, token de un agente, sobre una solicitud seed en estado `open` (p. ej. la que devuelve `GET /requests?status=open`).

### Expected result

`400` con `error.code === "INVALID_PRIORITY"` y mensaje "Priority must be low, medium or high.", tanto en `PATCH` como en `POST`. La aplicación valida antes del SQL (primera defensa) y la restricción `CHECK` de PostgreSQL se conserva intacta (segunda defensa).

### Actual result

`500 Internal Server Error`. El terminal mostraba que la restricción de PostgreSQL rechazó el valor (`'critical'` viola el `CHECK` de la columna `priority`).

### Hypotheses

1. **La prioridad no se valida en la aplicación**: `createRequest` y `patchRequest` no comprueban `priority` contra `['low','medium','high']` y dejan que la base responda (alta probabilidad; saltar al servicio confirma que `PRIORITIES` existe pero no se usa para validar prioridad). Cómo comprobarlo: leer `requests.service.js` — en `createRequest` no hay ningún chequeo de `priority`; en `patchRequest` hay validaciones de `title` y `status` pero no de `priority`.
2. **Se eliminó la restricción en alguna migración posterior** (improbable: las migraciones coinciden con la clase 06 y el `CHECK` está en `004_add_constraints_and_indexes.sql`). Cómo comprobarlo: inspeccionar `004` para ver que el `CHECK` sigue declarado.
3. **El cliente envía otro tipo (número) y la comparación falla** (improbable; el reporte es un string `'critical'`). Cómo comprobarlo: capturar el body en la ruta y registrar el tipo.

### Evidence

- Salida de reproducción: `PATCH /requests/38 { "priority": "critical" } → 500 INTERNAL_ERROR`.
- `src/modules/requests/requests.service.js` define `PRIORITIES = ['low', 'medium', 'high']` y lo usa al LISTAR, pero ni `createRequest` ni `patchRequest` lo aplican a la prioridad enviada por el cliente.
- La migración `004_add_constraints_and_indexes.sql` declara el `CHECK` de prioridad (la segunda defensa) — la base hacía el trabajo de la aplicación.

### Confirmed cause

La aplicación no validaba `priority` contra el conjunto permitido antes de escribir; el valor viajaba hasta PostgreSQL y la restricción `CHECK` lo rechazaba, traduciéndose en un 500 interno en vez de un 400 de contrato. Las prioridades válidas (`low`, `medium`, `high`) existen en `PRIORITIES` desde la clase 3, pero solo se aplicaban al filtrar, no al crear/actualizar.

### Correction

En `requests.service.js`:
- En `createRequest`, tras validar `title`, se valida `priority` contra `PRIORITIES` antes de abrir la transacción; si no está, `AppError('contract', 'INVALID_PRIORITY', 'Priority must be low, medium or high.')`.
- En `patchRequest`, la validación se agrega junto a las de `status`/`title`, ANTES del `withTransaction`. No se toca la migración; el `CHECK` de PostgreSQL permanece como segunda defensa.

### Regression test

`test/errors.test.js`:
- "an invalid priority answers 400 INVALID_PRIORITY before touching SQL".
- "a valid priority change still works after the fix" (`low` → `high` responde 200).
- extra: "POST with an invalid priority is rejected the same way" (`priority: 'urgent'` → 400).

Además `npm run incidents:reproduce` confirma `[INC-702] RESOLVED`.

## Error flow

Where is the error created?
In `src/app-error.js` (`AppError`) for typed errors thrown by services (contract, auth, forbidden, resource, domain) and untyped errors from dependencies (PostgreSQL, JSON parse) thrown anywhere in the stack.

How does it reach the error middleware?
Express 5 forwards rejected promises and thrown errors automatically. In `app.js`, `requestId` y `requestLogger` corren primero, luego los routers (`/auth`, `/requests`, `/health`), después `notFound` y por último `errorHandler`. Un `next(error)` (`notFound`, `authenticate`) o una promesa rechazada en una ruta aterriza en el único `errorHandler` registrado al final.

What is returned to the client?
Siempre el mismo contrato JSON `{ "error": { "code", "message" }, "requestId" }`:
- `AppError` → status según categoría (contract 400, auth 401, forbidden 403, resource 404, domain 409).
- JSON inválido en el body → `400 INVALID_JSON`.
- Base inalcanzable → `503 DATABASE_UNAVAILABLE`.
- Cualquier otra cosa → `500 INTERNAL_ERROR` genérico.

What remains only in the server log?
El nombre, mensaje y `stack` del error interno (`logger.error('internal_error', { name, message, stack })`), el origen de la base (`database_unavailable`) y los valores técnicos. Nunca viajan en la respuesta.

## Request ID

How did I prove that the response and log belong to the same request?
Con `npm run incidents:reproduce`, la sonda OPS-703 hace `GET /requests/999999999` y compara:
1. el header `x-request-id` de la respuesta,
2. el campo `requestId` del body del error,
3. y luego imprime la LÍNEA de log que contiene ese mismo `requestId`.
Las tres coinciden (`req_416e2a6d-...`), lo que demuestra que el error que llegó al cliente se correlaciona con su línea de log. Además `test/traceability.test.js` captura la consola durante una petición y verifica que existe una línea JSON cuyo `requestId === header` de la respuesta, y que el log jamás contiene el token ni `Authorization`.

## AI assistance

What did AI help me understand?
Que un `Number(req.params.id)` silenciosamente convierte `'not-a-number'` en `NaN`, y que ese `NaN` solo "explotaba" al compararse con una columna `bigint` — por eso el cliente veía 500 sin relación con su entrada, y el error técnico quedaba expuesto en el terminal. También que Express 5 forwardea las promesas rechazadas por sí solo, así que el manejo central de errores no exigía try/catch en cada ruta.

Which hypothesis did it propose?
La hipótesis del `NaN`/`Number()` como punto de entrada del problema y la de dejar que la base validara la prioridad (porque `PRIORITIES` no se aplicaba en escritura).

How did I verify it?
Lectura del código (`requests.routes.js`, `requests.service.js`), reproducción con el script de incidentes (que mostró el 500 real) y conversión de los stubs en pruebas de regresión que fallan sin el fix y pasan con él; el validador cerró con 12/12 PASS.

What suggestion was incomplete or incorrect?
La sugerencia inicial de "validar con parseInt y comparar > 0" habría aceptado `12abc` como `12`, contradiciendo el contrato del INC-701. Se corrigió validando la cadena COMPLETA con `/^\d+$/` y descartando el cero, tal como el ticket exige.

## Remaining doubt

Por qué el error de PostgreSQL `bigint` no se convertía en un 500 genérico por el manejo actual (antes de los cambios, `respond-error.js` mapeaba infra a 503 y lo demás a 500) pero el mensaje técnico aparecía igualmente en el terminal — es decir, la distinción "respuesta controlada" vs "detalle en consola" dependía de cada ruta; el middleware central la unifica. También queda por explorar en profundidad qué campos del body podrían filtrarse en logs si mañana alguien registra `req.body` entero en un módulo nuevo (la allowlist del `requestLogger` lo protege hoy, pero es una disciplina de equipo).