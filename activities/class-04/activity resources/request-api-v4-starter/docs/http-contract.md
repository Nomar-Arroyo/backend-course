# Contrato HTTP — Request API v3 (solución de referencia)

## Recurso

Una **solicitud de mantenimiento** (`request`): un problema reportado que el equipo debe
atender a lo largo de un ciclo de vida controlado.

### Forma del recurso

| Campo         | Tipo   | Obligatorio | Quién lo asigna | Notas                                        |
| ------------- | ------ | ----------- | --------------- | -------------------------------------------- |
| `id`          | number | sí          | servidor        | contador en memoria que solo avanza          |
| `title`       | string | sí          | cliente         | no vacío                                     |
| `description` | string | no          | cliente         | `""` si no se envía                          |
| `priority`    | string | no          | cliente         | `low` · `medium` · `high`; `medium` por defecto |
| `status`      | string | sí          | servidor/regla  | `open` al crear; cambia solo por transiciones válidas |
| `createdAt`   | string | sí          | servidor        | ISO 8601                                     |
| `updatedAt`   | string | sí          | servidor        | ISO 8601; cambia en cada modificación        |

### Estados y transiciones

Estados: `open`, `in_progress`, `resolved`, `closed`, `cancelled`.

Transiciones permitidas:

* `open → in_progress` · `open → cancelled`
* `in_progress → resolved` · `in_progress → cancelled`
* `resolved → in_progress` · `resolved → closed`

`closed` y `cancelled` son terminales: una solicitud en esos estados no admite ninguna
modificación.

### Formato de error (todas las respuestas de error)

```json
{ "error": { "code": "MACHINE_READABLE_CODE", "message": "Human readable message." } }
```

Códigos usados: `INVALID_FILTER`, `REQUEST_NOT_FOUND`, `TITLE_REQUIRED`, `INVALID_PRIORITY`,
`INVALID_STATUS`, `NO_UPDATABLE_FIELDS`, `INVALID_STATUS_TRANSITION`,
`REQUEST_IN_TERMINAL_STATUS`.

> Nota de evolución: la versión de la clase 02 devolvía `{ "error": "mensaje" }`. Este es un
> cambio potencialmente incompatible y se hace ahora, deliberadamente, mientras el único
> consumidor es el propio equipo. Queda documentado aquí.

---

## `GET /requests`

* **Intención**: consultar la colección, con filtros opcionales.
* **Query**: `status` (uno de los cinco estados) · `priority` (`low|medium|high`). Combinables.
* **Éxito**: `200` con arreglo (vacío incluido: `[]`).
* **Errores**: `400 INVALID_FILTER` si el valor del filtro no pertenece al conjunto.

```bash
curl -i "http://localhost:3000/requests?status=open&priority=high"
```

## `GET /requests/:id`

* **Intención**: consultar una solicitud concreta.
* **Éxito**: `200` con la solicitud.
* **Errores**: `404 REQUEST_NOT_FOUND`.

## `POST /requests`

* **Intención**: registrar una solicitud nueva.
* **Body**: `title` (obligatorio), `description` (opcional), `priority` (opcional).
  Todo otro campo se ignora — incluido `status`: una solicitud nueva siempre comienza `open`.
* **Éxito**: `201` con la solicitud completa (id, fechas y estado asignados por el servidor).
* **Errores**: `400 TITLE_REQUIRED` · `400 INVALID_PRIORITY`.

```bash
curl -i -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -d '{ "title": "Projector failure", "priority": "high" }'
```

## `PATCH /requests/:id`

* **Intención**: modificación parcial de una solicitud.
* **Body**: uno o más de `title`, `description`, `priority`, `status`.
  `id`, `createdAt` y `updatedAt` se ignoran si llegan.
* **Éxito**: `200` con la solicitud actualizada (`updatedAt` refrescado).
* **Errores**:

| Situación                          | Estado | Código                       |
| ---------------------------------- | -----: | ---------------------------- |
| Body sin campos modificables       |  `400` | `NO_UPDATABLE_FIELDS`        |
| Título vacío                       |  `400` | `TITLE_REQUIRED`             |
| Prioridad desconocida              |  `400` | `INVALID_PRIORITY`           |
| Estado desconocido                 |  `400` | `INVALID_STATUS`             |
| Solicitud inexistente              |  `404` | `REQUEST_NOT_FOUND`          |
| Solicitud en estado terminal       |  `409` | `REQUEST_IN_TERMINAL_STATUS` |
| Transición no permitida            |  `409` | `INVALID_STATUS_TRANSITION`  |

```bash
curl -i -X PATCH http://localhost:3000/requests/1 \
  -H "Content-Type: application/json" \
  -d '{ "status": "in_progress" }'
```

## Decisiones registradas

* [001 — Cancel requests instead of deleting them](decisions/001-cancel-instead-of-delete.md)
