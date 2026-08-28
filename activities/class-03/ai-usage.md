# AI usage

> Regla de la entrega: la IA puede proponer código, pero no puede decidir silenciosamente el
> contrato o las reglas del sistema. Solo se usa **después** de la marca `class-03-design`.
> No hace falta copiar conversaciones completas: registra lo esencial con honestidad.

## My design before using AI

El diseño quedó completo en el commit `class-03-design` y fue previo a cualquier prompt:

* `resource-model.md` — recurso Request, campos requeridos/opcionales/generados, 7
  invariantes.
* `http-contract.md` — formato de error `{ error: { code, message } }`, códigos de error y
  los 4 endpoints (`GET /requests` con filtros, `GET /requests/:id`, `POST /requests`,
  `PATCH /requests/:id`).
* `transition-map.md` — 5 estados (`open`, `in_progress`, `resolved`, `closed`,
  `cancelled`), 6 transiciones y 2 terminales.
* `test-matrix.md` — 8 casos de la clase + 2 propios.

Estas decisiones de contrato y reglas **no las cambió la IA**: vienen del diseño.

## What I asked the AI

Después de la marca de diseño:

* Implementar la migración de estructura `routes/ + data/` a `modules/requests/` sin
  cambiar el comportamiento de los 3 endpoints existentes.
* Implementar `PATCH /requests/:id` según el contrato (campos modificables, `409` para
  transición inválida y para estado terminal).
* Implementar filtros combinables `status` + `priority` en `GET /requests`.
* Escribir la nota de decisión y la reflexión con base en el diseño.

## What the AI proposed

* La estructura concreta de `request-status.js`, `requests.store.js` y `requests.routes.js`
  con una responsabilidad por archivo.
* El orden de validación en `PATCH`: 404 → `EMPTY_PATCH` → valores inválidos → terminal →
  transición.
* Revisar el template descargado de la presentación y confirmar que usaba `in_progress`
  (guion bajo) para los estados, igual que el diseño.

## What I accepted

* La estructura `modules/requests/` y la separación de responsabilidades del contrato.
* El formato de error `{ error: { code, message } }` en todas las rutas.
* Que `POST` ignore los campos que el servidor controla (`status`, `id`, fechas) y use
  `medium` como prioridad por defecto.
* Que el guardián de estados terminales proteja **cualquier** campo en `PATCH`, no solo
  `status` (por eso `PATCH` de prioridad sobre una cerrada da `409`, como pide la matriz).
* Que el contrato del proyecto (`activities/class-03/project/docs/http-contract.md`) sea el
  mismo documento de diseño aprobado, sin modificarlo.

## What I rejected or changed

* **`PUT`**: el template extra descargado incluía `PUT /requests/:id`, pero el contrato de
  la entrega define solo 4 endpoints y la actualización parcial viaja como `PATCH`. Se
  excluyó.
* **Capa `controllers/services/repositories`**: la IA no la propuso, pero si la hubiera
  propuesto se habría rechazado: el contrato la excluye explícitamente.
* **Librerías de validación**: fuera del contrato; la validación es mínima y manual.
* **`DELETE`**: rechazado por diseño — la decisión 001 documenta cancelar en vez de borrar.
* **La solución docente descargada en los recursos** (`request-api-v3-solucion`): no se
  usó para implementar. El curso la comparte después de la fecha de entrega; queda como
  material de revisión posterior.

## How I verified the result

Ejecuté los 10 casos de la matriz con `curl` contra el servidor corriendo y registré la
línea de estado literal y el cuerpo en `test-matrix.md`:

* `201` crear correctamente, `400 MISSING_TITLE`, `404 REQUEST_NOT_FOUND`, `200 []`
  (filtro sin resultados), `200` cambiar prioridad, `200` transición válida,
  `409 INVALID_STATUS_TRANSITION` (open → closed), `409 REQUEST_IN_TERMINAL_STATUS`
  (modificar cerrada), `400 INVALID_STATUS` (filtro desconocido), `400 EMPTY_PATCH`.
* También verifiqué que un `POST` con `status: "closed"` y prioridad ausente devuelve
  `201` con `status: "open"` y `priority: "medium"` (campos del servidor ignorados).

## What I still do not understand

* Cómo registra Express internamente las rutas de un `Router()` en la aplicación
  principal; lo uso, pero no sabría defender el mecanismo interno sin mirar la
  documentación.
* Por qué la reutilización de ids tras un reinicio (el contador vuelve a empezar) puede
  confundir a clientes que todavía recuerdan una solicitud anterior.