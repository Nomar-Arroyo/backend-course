# Query matrix — cada operación con su SQL y parámetros

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> Para cada operación del store: el SQL **parametrizado** (nunca concatenado) y qué
> parámetros lleva. Columnas explícitas siempre; nunca `SELECT *`.

## Regla transversal

* **Todo query usa parámetros** (`$1`, `$2`, ...). Los valores del cliente **nunca** se
  concatenan en la cadena SQL: concatenar es el origen de la inyección SQL y de bugs.
* **Columnas explícitas** en todos los `SELECT` y todos los `INSERT`/`UPDATE`. No `SELECT *`.
* Los **identificadores** (nombres de tabla/columna) no pueden ser parámetros: por eso los
  filtros se arman en el servicio, que **solo** deja pasar nombres de columna fijos y valores
  ya validados contra los conjuntos cerrados.

## 1. `findAll`

```sql
SELECT id, title, description, priority, status, created_at, updated_at
FROM requests
WHERE ($1::boolean IS FALSE OR status = $2)
  AND ($3::boolean IS FALSE OR priority = $4)
ORDER BY id ASC;
```

> **Aclaración sobre los filtros:** se puede construir el `WHERE` con sentencias
> condicionales en el store (columnas de nombres fijos) o bien usar una sola consulta con
> parámetros opcionales. La opción robusta y simple aquí: en el **service** se valida
> `status` y `priority` contra los conjuntos cerrados, y en el **store** se construye un
> `WHERE` con nombre de columna fijo (`status`/`priority`) y el valor siempre por parámetro.

**Forma concreta (comparadores opcionales, parámetros fijos):**

```sql
SELECT id, title, description, priority, status, created_at, updated_at
FROM requests
WHERE status = $1 OR $1 IS NULL
  AND priority = $2 OR $2 IS NULL
ORDER BY id ASC;
```

* `$1` = filtrar por `status` (o `null` = sin filtro)
* `$2` = filtrar por `priority` (o `null` = sin filtro)

Los valores ya pasaron validación en el servicio (si vienen indefinidos → `null`).

## 2. `findById`

```sql
SELECT id, title, description, priority, status, created_at, updated_at
FROM requests
WHERE id = $1;
```

* `$1` = el id numérico.

Devuelve `1` fila o `0`.

## 3. `insertRequest`

```sql
INSERT INTO requests (title, description, priority)
VALUES ($1, $2, $3)
RETURNING id, title, description, priority, status, created_at, updated_at;
```

* `$1` = title (ya sin espacios)
* `$2` = description (o `''`)
* `$3` = priority (default aplicado en el service: `medium`)

No se inserta `id`, `status`, `created_at` ni `updated_at`: los genera la base
(`IDENTITY`, `DEFAULT 'open'`, `CURRENT_TIMESTAMP`). `RETURNING` entrega la fila completa.

## 4. `updateRequest`

```sql
UPDATE requests
SET title = $1, description = $2, priority = $3, status = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $5
RETURNING id, title, description, priority, status, created_at, updated_at;
```

> El `SET` se arma en el store **solo** con los campos que el servicio decidió actualizar
> (nombres de columna fijos), y **siempre** se renueva `updated_at`.

* `$1..$4` = valores de los campos a cambiar (cada uno puede repetir el valor actual si no
  cambió)
* `$5` = el id.

Devuelve la fila actualizada o `0` filas si el id no existe.

## 5. `insertStatusHistory`

```sql
INSERT INTO request_status_history (request_id, previous_status, new_status)
VALUES ($1, $2, $3);
```

* `$1` = request_id
* `$2` = previous_status (o `null` en nacimiento)
* `$3` = new_status

## 6. `findHistory`

```sql
SELECT previous_status, new_status, changed_at
FROM request_status_history
WHERE request_id = $1
ORDER BY changed_at ASC;
```

* `$1` = request_id.

Orden cronológico (`changed_at ASC`) para leer la historia en orden.

## Mapa operación → query

| Operación del store | Query | Parámetros |
| ------------------- | ----- | ---------- |
| `findAll(filters)` | `SELECT ... FROM requests ...` | 0–2 (status, priority) |
| `findById(id)` | `SELECT ... WHERE id = $1` | 1 |
| `insertRequest(...)` | `INSERT ... RETURNING` | 3 |
| `updateRequest(...)` | `UPDATE ... WHERE id = $n` | 1 + #campos |
| `insertStatusHistory(...)` | `INSERT ... ` | 3 |
| `findHistory(id)` | `SELECT ... WHERE request_id = $1` | 1 |

> El ID de la solicitud al insertar el historial se obtiene de la fila `RETURNING` del
> `insertRequest` (mismo cliente, misma transacción), no del cliente.
