# HTTP contract — Request API v3

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> Para cada endpoint: intención, path, query, body, respuesta exitosa, errores y un ejemplo.
> El ejemplo obliga a decidir los detalles que la tabla esconde.

## Formato de error (común a toda la API)

```json
{
  "error": {
    "code": "CODE_NAME",
    "message": "Human readable message"
  }
}
```

El `code` es para programas: un `if` sobre `error.code` es robusto. El `message` es para
personas. Todo error de la API usa esta forma.

**Códigos existentes:**

| Código | Situación |
| ------ | --------- |
| `MISSING_TITLE` | `POST` sin `title` |
| `INVALID_PRIORITY` | `priority` con valor desconocido |
| `INVALID_STATUS` | `status` con valor desconocido (body o query) |
| `EMPTY_PATCH` | `PATCH` sin campos modificables |
| `REQUEST_NOT_FOUND` | `GET /requests/:id` o `PATCH /requests/:id` inexistente |
| `INVALID_STATUS_TRANSITION` | transición no permitida por la máquina de estados |
| `REQUEST_IN_TERMINAL_STATUS` | intento de modificar una solicitud en estado terminal |

---

## `GET /requests`

* **Intención**: listar la colección completa de solicitudes, opcionalmente filtrada.
* **Path**: `/requests`
* **Query**: `status` (opcional, ∈ `{open, in_progress, resolved, closed, cancelled}`)
  y `priority` (opcional, ∈ `{low, medium, high}`). Ambos son combinables.
* **Body**: ninguno.
* **Respuesta exitosa**: `200` con un arreglo. Sin coincidencias, la respuesta es
  honestamente `200 []` (vacío no es lo mismo que inexistente).
* **Errores**: `400` con `INVALID_STATUS` o `INVALID_PRIORITY` si el valor de un filtro no
  pertenece al conjunto conocido. "Existe pero no hay resultados" y "el filtro no significa
  nada" son cosas distintas.

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

## `POST /requests`

* **Intención**: crear una nueva solicitud de mantenimiento.
* **Body**: acepta `title` (requerido), `description` (opcional) y `priority` (opcional,
  → `medium`). El servidor **ignora** los campos que el cliente no controla (`id`,
  `status`, `createdAt`, `updatedAt`, y cualquier campo desconocido): la API es tolerante
  con lo que no le corresponde decidir.
* **Respuesta exitosa**: `201 Created` con el recurso completo: `id` generado, `status`
  `open`, y `createdAt`/`updatedAt` generados por el servidor.
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

* **Intención**: actualizar parcialmente una solicitud existente. Los cambios viajan como
  PATCH y no como acciones con nombre (decisión de la clase 3): la intención puede estar en
  el body, porque la máquina de estados protege cada transición en el servidor.
* **Body**: campos modificables `title`, `description`, `priority`, `status`. Campos del
  servidor (`id`, `createdAt`, `updatedAt`) se **ignoran** si se envían.
* **Respuesta exitosa**: `200` con el recurso actualizado (`updatedAt` se renueva).
* **Errores**:

| Situación | Estado | Código de error |
| --------- | -----: | --------------- |
| Body sin campos modificables | `400` | `EMPTY_PATCH` |
| `status` con valor desconocido | `400` | `INVALID_STATUS` |
| `priority` con valor desconocido | `400` | `INVALID_PRIORITY` |
| Recurso inexistente | `404` | `REQUEST_NOT_FOUND` |
| Transición no permitida | `409` | `INVALID_STATUS_TRANSITION` |
| Solicitud en estado terminal | `409` | `REQUEST_IN_TERMINAL_STATUS` |

La misma petición puede ser válida hoy (la solicitud está `resolved`) e inválida mañana
(volvió a `in_progress`): la forma no cambió, el estado sí. Por eso las transiciones se
rechazan con `409` (petición bien formada, prohibida por el estado actual) y no con `400`
(que es para la forma).

**Ejemplo (éxito)**

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