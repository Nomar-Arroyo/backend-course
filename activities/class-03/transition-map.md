# Transition map — ciclo de vida de una solicitud

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> Lo que no aparece como transición permitida está prohibido: los huecos también son reglas.

## Estados

* **`open`** — la solicitud fue reportada y está pendiente de atención.
* **`in_progress`** — el personal técnico ya está trabajando en ella.
* **`resolved`** — el equipo asume que el problema está resuelto, a la espera de que quien
  lo reportó lo confirme.
* **`closed`** — quien reportó (o la administración) confirmó la solución y se dio el cierre
  formal. **Terminal.**
* **`cancelled`** — el trabajo fue interrumpido sin resolverse (ya no se atenderá).
  **Terminal.**

## Transiciones permitidas

| Desde | Hacia | ¿Qué la dispara? |
| ----- | ----- | ---------------- |
| `open` | `in_progress` | el técnico comienza a trabajar en la solicitud |
| `open` | `cancelled` | se decide no atenderla |
| `in_progress` | `resolved` | el equipo reporta una solución |
| `in_progress` | `cancelled` | se interrumpe el trabajo en curso |
| `resolved` | `closed` | quien la reportó confirma la solución |
| `resolved` | `in_progress` | quien la reportó refuta la solución y se reabre |

## Transiciones inválidas notables

| Intento | Por qué se rechaza |
| ------- | ------------------ |
| `open → closed` | nadie cierra una solicitud sin atender |
| `open → resolved` | no puede saltarse la etapa de trabajo |
| `in_progress → closed` | falta la confirmación de quien la reportó |
| `resolved → cancelled` | si ya se resolvió, el único flujo lógico es confirmarla o reabrirla |
| `closed → *` | es un estado terminal: no admite salida |
| `cancelled → *` | es un estado terminal: no admite salida |

## Estados terminales

`closed` y `cancelled` no admiten transiciones de salida. Si llega un `PATCH` sobre una
solicitud en estado terminal — modifique el `status` o cualquier otro campo — la API
responde `409` con `REQUEST_IN_TERMINAL_STATUS`.

## Justificación

Este mapa permite el camino feliz (`open → in_progress → resolved → closed`) más dos
salidas laterales (`→ cancelled`) y un retorno (`resolved → in_progress`). No es una secuencia
obligatoria única: hay bifurcaciones, y lo único obligatorio es no salirse de las flechas.

**`resolved → in_progress` sí existe; `closed → in_progress` no.** `resolved` es una
afirmación del equipo ("creemos que está listo") que quien reportó puede refutar si el
problema persiste; reabrir devuelve la solicitud a trabajo. `closed`, en cambio, es un
estado terminal de conformidad: el usuario o administrador ya auditó y dio el visto bueno
final. Una vez alcanzado el cierre formal, no se reactiva la misma entidad; si ocurre algo
nuevo, se abre una nueva Request.

**`resolved → cancelled` se rechaza.** La cancelación es una salida anticipada para
interrumpir un trabajo **en curso o pendiente** (`in_progress`, `open`). Si el recurso ya
pasó por el ciclo de trabajo y llegó a `resolved`, cancelarlo carece de sentido semántico:
la solicitud ya fue atendida, por lo que el único flujo lógico es su confirmación
(`closed`) o su reapertura (`in_progress`).

**Cancelar ≠ cerrar.** Ambos terminan la solicitud, pero cuentan historias distintas:
cerrar culmina el trabajo con confirmación; cancelar lo interrumpe sin resolverlo. La
distinción permite auditar por qué una solicitud terminó sin atenderse.