# Resource model — Request

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> No toda palabra del requerimiento se convierte en ruta o campo: parte del trabajo es
> decidir qué entra, qué espera y qué se pregunta.

## Nombre del recurso

**Request** — una solicitud o reporte de mantenimiento del plantel.

> "Una Request representa un incidente o necesidad de mantenimiento reportado por un
> usuario del plantel que requiere evaluación y resolución por parte del personal técnico."

## Propiedades

| Propiedad | Tipo | Ejemplo |
| --------- | ---- | ------- |
| `id` | number | `1` |
| `title` | string | `"Projector does not turn on"` |
| `description` | string | `"The projector in room 204 shows no image during class."` |
| `status` | string (enum) | `"open"` |
| `priority` | string (enum) | `"medium"` |
| `createdAt` | string (ISO 8601) | `"2026-08-28T14:00:00.000Z"` |
| `updatedAt` | string (ISO 8601) | `"2026-08-28T14:00:00.000Z"` |

## Campos requeridos

* **`title`**: una solicitud sin título no comunica qué falla. Su ausencia se rechaza con
  `400`.

## Campos opcionales

* **`description`**: opcional. Al no generar un costo computacional ni impactar
  negativamente el modelo por omitirla, se da flexibilidad al cliente para no enviarla si
  el título cubre suficiente contexto.
* **`priority`**: opcional. Si llega, debe ser uno de `{low, medium, high}`; si no llega,
  el servidor aplica `medium` por defecto.

## Campos generados por el servidor

* **`id`**: un contador en memoria que solo avanza. No depende de `array.length + 1`: la
  identidad no puede depender de cuántos elementos hay, porque esa cantidad cambia.
* **`status`**: siempre nace en `open`. El cliente no decide el estado inicial.
* **`createdAt`** y **`updatedAt`**: los genera el servidor. Si los generara el cliente,
  dos clientes podrían chocar y las fechas serían tan confiables como el reloj de cada
  cliente.

El cliente **no puede fijar** ninguno de estos campos: si los envía, se ignoran.

## Estados permitidos

La lista cerrada de valores de `status` es:

`open`, `in_progress`, `resolved`, `closed`, `cancelled`

## Reglas

* Nunca existirá una solicitud **sin título**.
* Nunca existirá una solicitud cuyo `status` esté fuera de
  `{open, in_progress, resolved, closed, cancelled}`.
* Nunca existirá una solicitud que cambie de estado **desde un estado terminal**
  (`closed`, `cancelled`).
* Nunca existirá una solicitud cuyo `id`, `createdAt` o `updatedAt` hayan sido **fijados
  por el cliente**.
* Toda solicitud **inicia en `open`**.
* Nunca existirá una solicitud con `priority` fuera de `{low, medium, high}`.
* Toda respuesta de error tendrá la forma `{ "error": { "code": "...", "message": "..." } }`.

## Dudas

* ¿Quiénes están autorizados a **cancelar** una solicitud (quien la reporta, el técnico,
  administración)? El requerimiento no lo dice; hoy no hay autenticación.
* ¿La **prioridad** la decide el cliente al reportar o el técnico al revisar?
  Se asume que la reporta el cliente.
* ¿Deben existir **paginación u ordenamiento** cuando la colección crezca?
  Queda fuera de esta entrega.