# AI usage

> Regla de la entrega: la IA puede proponer código, pero no puede decidir silenciosamente el
> contrato o las reglas del sistema. Solo se usa **después** de la marca `class-04-design`.
> No hace falta copiar conversaciones completas: registra lo esencial con honestidad.

## My design before using AI

El diseño quedó completo en el commit y tag `class-04-design` y fue previo a cualquier
uso de IA para implementar:

* `data-model.md` — tabla `requests` (identidad, checks, defaults) y
  `request_status_history` (FK, `previous_status` nullable = nacimiento).
* `persistence-contract.md` — operaciones del store (SQL), mapeo fila → representación,
  errores sin filtrar secretos, fail-fast de `DATABASE_URL`.
* `query-matrix.md` — SQL parametrizado de cada operación, columnas explícitas.
* `transaction-plan.md` — `withTransaction`, el mismo cliente en toda la unidad, COMMIT/
  ROLLBACK/release.
* `error-map.md` — categorías (contract/resource/domain/persistence/infrastructure/
  internal) y código HTTP; conserva el catálogo de clase 3.
* `test-matrix.md` — 12 casos (8 de la clase + 4 propios), con los esperados declarados.

Estas decisiones de contrato y reglas **no las cambió la IA**: vienen del diseño.

## What I asked the AI

Después de la marca de diseño:

* Completar la migración 002 (checks de `request_status_history`) usando las decisiones de
  `data-model.md`.
* Implementar `withTransaction` según el contrato de `transaction-plan.md`.
* Implementar el store SQL (`findAll`, `findById`, `insertRequest`/RETURNING,
  `updateRequest`, `insertStatusHistory`, `findHistory`), parametrizado, con el parámetro
  `db` opcional.
* Implementar el service (`listRequests`, `getRequest`, `createRequest`, `patchRequest`,
  `getHistory`) con `AppError` y unidades de trabajo.
* Implementar el mapper (`mapRequestRow`, `mapHistoryRow`) respetando el contrato camelCase.
* Convertir las rutas a asíncronas y añadir `GET /requests/:id/history`, traduciendo los
  errores tipeados y nunca filtrando errores crudos de `pg`.
* Revisar (IA como revisor) contra `error-map.md` y `http-contract.md` para detectar
  códigos de error que difieran del contrato publicado.

## What the AI proposed

* El antipatrón "un query por pool/distinto cliente dentro de una transacción" y por qué el
  `db` debe ser el cliente de la transacción.
* Traducir los errores de conexión (`ECONNREFUSED`, SQLSTATE `08...`) a
  `503 DATABASE_UNAVAILABLE` con `isDatabaseUnavailable`, sin filtrar el mensaje crudo.
* Registrar `ROLLBACK` en `finally` + `release()` siempre.
* Usar `INSERT ... RETURNING` para obtener `id` y fechas en una sola consulta.

## What I accepted

* El `withTransaction` con `client.release()` en `finally`.
* El store con columnas explícitas y nombres de columna fijos (nunca desde el cliente).
* El service como capa de coordinación que lanza `AppError` y define las unidades de
  trabajo (crear = insert solicitud + nacimiento; PATCH = validar + update + historial).
* Conservar el catálogo de errores de clase 3 (`MISSING_TITLE`, `EMPTY_PATCH`,
  `INVALID_STATUS`, `INVALID_PRIORITY`, `REQUEST_NOT_FOUND`,
  `INVALID_STATUS_TRANSITION`, `REQUEST_IN_TERMINAL_STATUS`) y añadir
  `DATABASE_UNAVAILABLE` (503) e `INTERNAL_ERROR` (500).
* Descartar los códigos del starter que diferían del contrato publicado (`TITLE_REQUIRED`,
  `NO_UPDATABLE_FIELDS`, `INVALID_FILTER`): el contrato de los cuatro endpoints de clase 3
  no cambia.

## What I rejected or changed

* **`pool.query()` dentro de la transacción**: rechazado; el store recibe el `client` de la
  transacción como `db`.
* **Filtrar errores desconocidos**: se rechaza reenviar el `error` crudo de `pg`; se
  registra en consola y el cliente solo ve códigos seguros.
* **`DELETE`**: sigue fuera (decisión 001).
* **La solución docente / starter**: el starter se usó como base estructural, no como
  implementación final; los TODO se completaron con el diseño propio.

## How I verified the result

Pendiente de completar en la fase de evidencia: `npm run db:check` contra Supabase,
migraciones 001 y 002, seed, y los 12 casos de la matriz con `curl -i` (incluyendo
persistencia tras reinicio y rollback).

## What I still do not understand

Pendiente de completarse con la reflexión final.