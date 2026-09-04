# HTTP contract — Request API v4

Contrato vigente de la API. Hereda íntegro el contrato de clase 3 (los cuatro endpoints
existentes NO cambian) y añade la consulta de historial (`GET /requests/:id/history`).
Ver también la máquina de estados en `src/modules/requests/request-status.js` y el mapa de
errores en `activities/class-04/error-map.md`.

## Formato de error (común a toda la API)

```json
{
  "error": {
    "code": "CODE_NAME",
    "message": "Human readable message"
  }
}
```

**Códigos existentes (clase 3, sin cambios):**

| Código | Situación |
| ------ | --------- |
| `MISSING_TITLE` | `POST` o `PATCH` sin `title` válido |
| `INVALID_PRIORITY` | `priority` con valor desconocido (body o query) |
| `INVALID_STATUS` | `status` con valor desconocido (body o query) |
| `EMPTY_PATCH` | `PATCH` sin campos modificables |
| `REQUEST_NOT_FOUND` | `GET /requests/:id`, `GET /requests/:id/history` o `PATCH /requests/:id` inexistente |
| `INVALID_STATUS_TRANSITION` | transición no permitida por la máquina de estados |
| `REQUEST_IN_TERMINAL_STATUS` | intento de modificar una solicitud en estado terminal |

**Códigos nuevos (clase 4):**

| Código | Situación | Estado |
| ------ | --------- | -----: |
| `DATABASE_UNAVAILABLE` | la base de datos no responde | `503` |
| `INTERNAL_ERROR` | error inesperado (detalle solo en el log del servidor) | `500` |

> Nunca se filtran al cliente los errores crudos de `pg` ni el `DATABASE_URL`.

---

## `GET /requests`

* **Intención**: listar la colección completa de solicitudes, opcionalmente filtrada.
* **Path**: `/requests`
* **Query**: `status` (opcional, ∈ `{open, in_progress, resolved, closed, cancelled}`)
  y `priority` (opcional, ∈ `{low, medium, high}`). Ambos son combinables.
* **Body**: ninguno.
* **Respuesta exitosa**: `200` con un arreglo. Sin coincidencias, `200 []`.
* **Errores**: `400` con `INVALID_STATUS` o `INVALID_PRIORITY` si el valor de un filtro no
  pertenece al conjunto conocido.

**Ejemplo (filtrado combinado)**

```http
GET /requests?status=open&priority=high

HTTP/1.1 200 OK
[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high",
    "createdAt": "2026-08-28T14:00:00.000Z",
    "updatedAt": "2026-08-28T14:00:00.000Z"
  }
]
```

---

## `GET /requests/:id`

* **Intención**: obtener una solicitud concreta por su identificador.
* **Path**: `/requests/:id`
* **Respuesta exitosa**: `200` con el recurso completo.
* **Errores**: `404` con `REQUEST_NOT_FOUND` si no existe ese id.

**Ejemplo (inexistente)**

```http
GET /requests/999

HTTP/1.1 404 Not Found
{
  "error": {
    "code": "REQUEST_NOT_FOUND",
    "message": "Request 999 was not found"
  }
}
```

---

## `GET /requests/:id/history`

* **Intención**: obtener la historia de estados de una solicitud en orden cronológico.
* **Path**: `/requests/:id/history`
* **Respuesta exitosa**: `200` con un arreglo de eventos. Toda solicitud que existe tiene
  al menos su evento de nacimiento. Los eventos llegan ordenados de más antiguo a más
  reciente (`changed_at ASC`).
* **Errores**: `404` con `REQUEST_NOT_FOUND` si no existe esa solicitud.

**Ejemplo (solicitud con una transición)**

```http
GET /requests/2/history

HTTP/1.1 200 OK
[
  {
    "previousStatus": null,
    "newStatus": "open",
    "changedAt": "2026-08-18T09:30:00.000Z"
  },
  {
    "previousStatus": "open",
    "newStatus": "in_progress",
    "changedAt": "2026-08-19T11:15:00.000Z"
  }
]
```

---

## `POST /requests`

* **Intención**: crear una nueva solicitud de mantenimiento.
* **Body**: acepta `title` (requerido), `description` (opcional) y `priority` (opcional,
  → `medium`). El servidor **ignora** los campos que el cliente no controla (`id`,
  `status`, `createdAt`, `updatedAt`, y cualquier campo desconocido).
* **Respuesta exitosa**: `201 Created` con el recurso completo: `id` generado por
  PostgreSQL (`IDENTITY`), `status` `open`, y `createdAt`/`updatedAt` generados por la
  base (`CURRENT_TIMESTAMP`). El evento de nacimiento queda registrado en el historial
  (misma transacción).
* **Errores**: `400` con `MISSING_TITLE` si falta el título; `400` con `INVALID_PRIORITY`
  si llega una prioridad desconocida.

**Ejemplo**

```http
POST /requests
{
  "title": "Broken door lock",
  "description": "The lock on room 101 does not turn properly.",
  "priority": "high"
}

HTTP/1.1 201 Created
{
  "id": 6,
  "title": "Broken door lock",
  "description": "The lock on room 101 does not turn properly.",
  "status": "open",
  "priority": "high",
  "createdAt": "2026-08-28T15:30:00.000Z",
  "updatedAt": "2026-08-28T15:30:00.000Z"
}
```

---

## `PATCH /requests/:id`

* **Intención**: actualizar parcialmente una solicitud existente. Si el cambio incluye
  `status`, la transición se valida contra la máquina de estados y su evento se registra
  en el historial como parte de la misma transacción.
* **Body**: campos modificables `title`, `description`, `priority`, `status`. Campos del
  servidor (`id`, `createdAt`, `updatedAt`) se **ignoran** si se envían.
* **Respuesta exitosa**: `200` con el recurso actualizado (`updatedAt` se renueva).
* **Errores**:

| Situación | Estado | Código de error |
| --------- | -----: | --------------- |
| Body sin campos modificables | `400` | `EMPTY_PATCH` |
| `status` con valor desconocido | `400` | `INVALID_STATUS` |
| `priority` con valor desconocido | `400` | `INVALID_PRIORITY` |
| `title` vacío | `400` | `MISSING_TITLE` |
| Recurso inexistente | `404` | `REQUEST_NOT_FOUND` |
| Transición no permitida | `409` | `INVALID_STATUS_TRANSITION` |
| Solicitud en estado terminal | `409` | `REQUEST_IN_TERMINAL_STATUS` |

La misma petición puede ser válida hoy (la solicitud está `resolved`) e inválida mañana
(volvió a `in_progress`): la forma no cambió, el estado sí. Por eso las transiciones se
rechazan con `409` (petición bien formada, prohibida por el estado actual) y no con `400`
(que es para la forma).

**Ejemplo (éxito, con cambio de estado)**

```http
PATCH /requests/1
{
  "status": "in_progress",
  "priority": "high"
}

HTTP/1.1 200 OK
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "in_progress",
  "priority": "high",
  "createdAt": "2026-08-28T14:00:00.000Z",
  "updatedAt": "2026-08-29T09:15:00.000Z"
}
```

**Ejemplo (transición inválida)**

```http
PATCH /requests/1
{
  "status": "closed"
}

HTTP/1.1 409 Conflict
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot move a request from open to closed"
  }
}
```