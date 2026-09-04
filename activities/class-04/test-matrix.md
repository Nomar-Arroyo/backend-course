# Test matrix — Entrega 04 (12 casos mínimos)

> Fase 1: se declaró el resultado **esperado**. Fase 6: se ejecutó cada caso contra
> PostgreSQL (Supabase) y se registró el resultado **observado** (línea de estado literal
> `HTTP/1.1 ...`). La evidencia confirma persistencia tras reinicio y rollback.

## Datos semilla

La base se pobló con `database/seed.sql`: tres solicitudes con su evento de nacimiento y
una transición (`open → in_progress`). Los ids los asigna PostgreSQL (`IDENTITY`), por lo
que en ejecución dependen del estado de la base; la referencia es la solicitud creada en el
caso 2 (id `5`).

| id | title | status | priority |
| -- | ----- | ------ | -------- |
| 1 | Projector does not turn on | `open` | `high` |
| 2 | Broken chair in the lab | `in_progress` | `medium` |
| 3 | Wi-Fi drops in the library | `open` | `low` |
| 5 | Evidence request (caso 2) | `open` → `in_progress` (caso 10) | `high` |

## Resultados observados

| # | Caso | Petición / acción | Resultado observado |
| - | ----- | ----------------- | ------------------- |
| 1 | Conectar correctamente | `npm run db:check` | `✓ Environment variable found`, `✓ Database connection established`, `✓ PostgreSQL version detected` → `{ database_name: 'postgres', postgres_version: 'PostgreSQL 17.6 ...' }` |
| 2 | Crear solicitud | `POST /requests` | `HTTP/1.1 201 Created` — `{"id":5,"title":"Evidence request","description":"...","priority":"high","status":"open","createdAt":"2026-09-04T17:39:42.774Z","updatedAt":"..."}` |
| 3 | Persistencia tras reinicio | Reiniciar Express → `GET /requests/5` | `HTTP/1.1 200 OK` — mismos `id`, `title`, `priority`, `createdAt` tras el reinicio |
| 4 | Filtrar sin resultados | `GET /requests?status=closed&priority=high` | `HTTP/1.1 200 OK` — `[]` |
| 5 | Transición inválida | `PATCH /requests/5` `{"status":"closed"}` | `HTTP/1.1 409 Conflict` — `{"error":{"code":"INVALID_STATUS_TRANSITION","message":"Cannot move a request from open to closed"}}` |
| 6 | Consultar historial | `GET /requests/5/history` | `HTTP/1.1 200 OK` — 2 eventos en orden cronológico (ver caso 10) |
| 7 | Falla del historial (rollback) | Unidad de trabajo con `insertStatusHistory` fallando | `INSERT request OK, id=7` → `Failed inside withTransaction: code=23514` → `requests after failed unit (ROLLBACK): 0` → la solicitud NO quedó creada (rollback verificado) |
| 8 | Base no disponible | Conexión al pool con host/credencial inalcanzable | `HTTP/1.1 503 Service Unavailable` — `{"error":{"code":"DATABASE_UNAVAILABLE","message":"The database is currently unavailable. Please try again later."}}` (sin secretos) |
| 9 | Crear sin título | `POST /requests` `{"description":"no title"}` | `HTTP/1.1 400 Bad Request` — `{"error":{"code":"MISSING_TITLE","message":"Title is required"}}` |
| 10 | PATCH registra evento en historial | `PATCH /requests/5` `{"status":"in_progress"}` | `HTTP/1.1 200 OK` — `{"id":5, ...,"status":"in_progress", ...}`. Historial: `[{"previousStatus":null,"newStatus":"open",...},{"previousStatus":"open","newStatus":"in_progress",...}]` |
| 11 | Historial de solicitud inexistente | `GET /requests/999/history` | `HTTP/1.1 404 Not Found` — `{"error":{"code":"REQUEST_NOT_FOUND","message":"Request 999 was not found"}}` |
| 12 | Filtro con valor desconocido | `GET /requests?status=abierta` | `HTTP/1.1 400 Bad Request` — `{"error":{"code":"INVALID_STATUS","message":"\"abierta\" is not a valid status filter"}}` |

### Casos propios (justificación)

* **Caso 9** (`400 MISSING_TITLE`): la validación de contrato sobrevive al store persistente.
* **Caso 10** (historial tras PATCH): cada transición **escribe** su evento, no solo es
  legible el seed (produce los eventos del caso 6).
* **Caso 11** (`404` en history): el endpoint nuevo distingue "sin historial" de
  "recurso inexistente".
* **Caso 12** (`400 INVALID_STATUS` en filtro): mantiene la regla de clase 3 de contrato.

## Evidencia obligatoria

### Persistencia: antes / reinicio / después

```
POST /requests { "title": "Evidence request", priority: high }
HTTP/1.1 201 Created
{"id":5,"title":"Evidence request", ..., "createdAt":"2026-09-04T17:39:42.774Z","updatedAt":"2026-09-04T17:39:42.774Z"}

# Se detiene Express (Stop-Process node) y se arranca de nuevo
GET /requests/5
HTTP/1.1 200 OK
{"id":5,"title":"Evidence request", ..., "createdAt":"2026-09-04T17:39:42.774Z","updatedAt":"2026-09-04T17:39:42.774Z"}
```

Mismos datos antes y después del reinicio: el estado vive en la base, no en el proceso.

### Rollback

```
# Unidad de trabajo (withTransaction) con insertStatusHistory fallando:
#   INSERT request OK, id=7
#   Failed inside withTransaction: code=23514 (new row for relation
#   "request_status_history" violates check constraint
#   "request_status_history_new_check")
#   requests after failed unit (ROLLBACK): 0
```

La consulta posterior demuestra que la solicitud NO quedó creada: `requests` quedó intacta.

## Regla de evidencia sin secretos

Ningún volcado incluye `DATABASE_URL` ni la contraseña: solo el nombre de la base
(`postgres`), la versión (`PostgreSQL 17.6`) y resultados de consultas. El `.env` real está
en `.gitignore` y nunca se commitea (verificado con `git check-ignore`).