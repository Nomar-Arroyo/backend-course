# Responsibility map — Clase 08

Mapa de responsabilidades del handler cargado ANTES de refactorizar.
Complétalo mientras lees `GET /:id/history` en `requests.routes.js`.

## El handler analizado

Ruta/operación: `GET /requests/:id/history` — líneas 38-97 de `requests.routes.js`.

## Clasificación de bloques

Para cada bloque del handler, anota a qué categoría pertenece y qué líneas
lo forman (aprox.):

| Categoría | ¿Qué hace ese bloque aquí? | ¿A qué archivo debería moverse? |
| --- | --- | --- |
| HTTP (leer params/identidad) | L39-45: valida `req.params.id` con una regex escrita a mano y lanza `INVALID_REQUEST_ID` si falla (duplica `parseIdParam`). L96: responde `res.status(200).json(events)`. | La validación a `src/http/parse-id.js` (el patrón de todas las demás rutas); la respuesta queda donde corresponde: en la route, traduciendo HTTP. |
| Aplicación (coordinar el caso) | NO EXISTE. El handler salta de validar a SQL, a reglas a mano, a más SQL, a mapping, sin ninguna capa de coordinación: el caso de uso no tiene nombre propio. | Nuevo `getHistory({ actor, id })` en `requests.service.js`, que decide el orden: leer -> autorizar -> consultar -> representar. |
| Negocio (¿puede verse?) | L58-64: reescribe la regla de visibilidad a mano (`isAgent`, `isOwner`, y si falla lanza 404 como si no existiera). Misma regla y mismo mensaje que `canViewHistory`. | `request.policy.js` → `canViewHistory(actor, request)` (ya existe; vuelve a quedar en un solo lugar). |
| Persistencia (SQL) | L47-56: `SELECT ... FROM requests WHERE id = $1` con `pool` directo. L66-73: `SELECT ... FROM request_history ... ORDER BY created_at, id`. Ambos son texto SQL dentro de una route. | `requests.store.js` → `findById(id)` y `findHistory(requestId)` (ambos ya existen, con el mismo SELECT y el mismo ORDER BY). |
| Presentación (construir respuesta) | L75-93: transforma cada fila con un branch manual (`priority_changed` vs. el resto) para construir el shape camelCase del contrato. Duplica `mapHistoryEventRow`. | `request.mapper.js` → `mapHistoryEventRow(row)` (ya existe, con el mismo branching y el mismo shape). |
| Observabilidad (errores/requestId) | L55, L63: lanzan `AppError('resource', 'REQUEST_NOT_FOUND', ...)`. El `requestId` NO lo agrega este bloque: lo pone `src/middleware/error-handler.js` al traducir el error. La observabilidad aquí se reduce a "lanzar el AppError correcto" — pero está mezclada con SQL y reglas. | La traducción AppError → JSON con `requestId` permanece en `src/middleware/error-handler.js`; el handler solo lanza (como ya hacen las otras rutas vía service). |

## Las preguntas del análisis

* ¿Cuántas RAZONES distintas tiene esta función para cambiar?

  6 razones independientes: (1) el formato/validación del id; (2) cómo se
  lee la solicitud (columnas, JOINs, índices); (3) quién puede ver el
  historial (reglas de rol); (4) cómo se lee el historial; (5) la
  representación de cada evento; (6) el contrato HTTP (status/body) de la
  respuesta. Cualquier cambio de negocio o de infraestructura golpea a esta
  ruta, aunque no tenga nada que ver con HTTP.

* ¿Qué piezas ya existentes del proyecto duplica? (pista: mira store, mapper y policy)

  `parseIdParam` (src/http/parse-id.js), `findById` y `findHistory`
  (requests.store.js), `canViewHistory` / `canViewRequest`
  (request.policy.js) y `mapHistoryEventRow` (request.mapper.js). Las
  cinco duplicaciones son literales: mismos queries, misma regla, mismo
  shape. Hoy existen dos verdades en paralelo y hay que mantenerlas
  sincronizadas a mano.

* ¿Qué NO se puede probar de forma aislada mientras todo viva junto?

  - La regla de visibilidad: hoy solo se ejercita a través de HTTP+TDB
    real; la pareja policy pura / prueba sin servidor queda inutilizada.
  - El mapping de eventos con filas sintéticas (sin PostgreSQL).
  - La coordinación del caso: no existe `getHistory`, así que no hay
    forma de pedir "el historial visible para este actor" sin levantar
    Express.
  - Las fallas de infraestructura (p. ej. DB caída) sin servidor.
  - Reutilizar la operación desde otro punto: la lógica está cosida a la
    ruta, no invocable por nombre.