# Data model — Persistencia de solicitudes y su historial

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> El estado del sistema deja de pertenecer al proceso (array en memoria) y pasa a una base
> de datos compartida. Persistir no es reemplazar un array por una tabla: es decidir cómo
> representar, proteger, recuperar y coordinar el estado.

## Introducción

En la clase 3 el estado vivía en `requests.store.js` como un arreglo en memoria: al
reiniciar Express, todo se perdía. En esta clase el estado pasa a **PostgreSQL** (base
compartida). La tabla `requests` es la forma persistente del recurso `Request` de clase 3,
y se añade una segunda tabla, `request_status_history`, para conservar la historia de cada
cambio de estado.

## Tabla `requests`

Registros persistentes de cada solicitud de mantenimiento.

| Columna | Tipo | Restricción | Descripción |
| ------- | ---- | ----------- | ----------- |
| `id` | `BIGINT` | `GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Identidad generada por PostgreSQL |
| `title` | `VARCHAR(200)` | `NOT NULL` | Título, obligatorio |
| `description` | `TEXT` | — | Descripción, opcional |
| `priority` | `VARCHAR(20)` | `NOT NULL DEFAULT 'medium'` · `CHECK` ∈ `{low, medium, high}` | Prioridad |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'open'` · `CHECK` ∈ `{open, in_progress, resolved, closed, cancelled}` | Estado del ciclo de vida |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Fecha de creación (la pone la base) |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Última actualización |

### Quién protege qué

| Regla | Quién la protege |
| ----- | ---------------- |
| `title` obligatorio | **Aplicación** (`MISSING_TITLE`) y la base (`NOT NULL`) |
| `priority` ∈ `{low, medium, high}` | **Aplicación** (`INVALID_PRIORITY`) y la base (`CHECK`) |
| `status` ∈ los cinco estados | **Aplicación** (`INVALID_STATUS`) y la base (`CHECK`) |
| Estado inicial `open` | **Aplicación** (default al insertar) y la base (`DEFAULT 'open'`) |
| Identidad (`id`) no proviene del cliente | **Servidor** (`IDENTITY`, nunca del body) |
| Cambio de `status` dentro de transiciones permitidas | **Aplicación** (`request-status.js`: `canTransition`). La base solo garantiza que el valor sea válido, no la transición. |
| Modificaciones sobre estado terminal | **Aplicación** (`REQUEST_IN_TERMINAL_STATUS`). La base no sabe qué es "terminal". |

> La base protege la **forma** (tipos, valores permitidos, obligatoriedad). La aplicación
> protege las **reglas de negocio** (transiciones, terminales, filtros). Son capas distintas.

## Tabla `request_status_history`

Historial de cada cambio de estado de una solicitud. Una fila por evento de transición (o
nacimiento).

| Columna | Tipo | Restricción | Descripción |
| ------- | ---- | ----------- | ----------- |
| `id` | `BIGINT` | `GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Identidad del evento |
| `request_id` | `BIGINT` | `NOT NULL` · `FOREIGN KEY REFERENCES requests(id)` | A qué solicitud pertenece |
| `previous_status` | `VARCHAR(30)` | acepta `NULL` · `CHECK` (NULL o ∈ cinco estados) | Estado anterior |
| `new_status` | `VARCHAR(30)` | `NOT NULL` · `CHECK` ∈ cinco estados | Nuevo estado |
| `changed_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Cuándo ocurrió |

### ¿Por qué `previous_status` acepta NULL?

**NULL = nacimiento.** Una solicitud nace directamente en `open`; en ese momento **no hubo
un estado anterior** que registrar. El evento de nacimiento tiene `new_status = 'open'` y
`previous_status = NULL`, porque "open fue el primer estado" y no hay nada antes. Un valor
`NOT NULL` nos obligaría a inventar un estado previo falso que nunca existió. `NULL` es la
representación honesta de "no hay estado previo".

### ¿Por qué `new_status` NO acepta NULL?

Todo evento de historial describe **el estado al que se llegó**. No existe un evento que no
produzca ningún estado: nacimiento → `open`, transición → el estado destino. `new_status`
sin valor no tendría significado.

### Relaciones

* `request_status_history.request_id` → `requests.id` (uno a muchos: una solicitud tiene
  muchos eventos). `ON DELETE` no se define porque en este sistema **no hay DELETE** (decisión
  001: cancelar en vez de borrar).

## Restricciones totales y invariantes persistentes

* `id` siempre generado por la base; el cliente nunca lo entrega.
* `title` nunca vacío/ausente.
* `priority` y `status` siempre con valores del conjunto cerrado.
* `request_status_history` solo referencia solicitudes que existen (FK).
* El primer evento de cada solicitud tiene `previous_status = NULL` (nacimiento).

## Materialización en el repositorio

El esquema vive versionado en `database/migrations/`:

```
database/
├── migrations/
│   ├── 001_create_requests.sql
│   └── 002_create_request_status_history.sql
└── seed.sql
```

* **001** crea `requests` con identidad, checks y defaults.
* **002** crea `request_status_history`, completa los dos CHECK y el FK, y quita el
  placeholder.
* **seed.sql** inserta tres solicitudes con sus eventos de nacimiento y una transición
  (`open → in_progress`) para que los casos de prueba tengan historia que consultar.

## Dudas

* ¿El `updated_at` se debe refrescar en cada PATCH aunque no cambie el status?
  Se asume que sí: cualquier modificación renueva la fecha de actualización.
* ¿Debe haber un límite de longitud para `description`? No se impone; es opcional.
* ¿Queremos que `GET /requests/:id/history` devuelva eventos ordenados? Se decide ordenar
  por `changed_at ASC` (cronológico) para que la historia se lea en orden.
