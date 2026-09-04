# Test matrix — Entrega 04 (12 casos mínimos)

> Fase 1: se declara el resultado **esperado**. Fase 6: se ejecuta cada caso y se registra
> el resultado **observado** (línea de estado literal, `HTTP/1.1 ...`), con evidencia que
> demuestre persistencia y rollback. Los observados se llenan ejecutando, no copiando.

## Datos semilla

La base se puebla con `database/seed.sql`: tres solicitudes con sus eventos de nacimiento
y una transición (`open → in_progress` en el id que corresponda) para que los casos tengan
historia que consultar.

| id | title | status | priority |
| -- | ----- | ------ | -------- |
| 1 | Projector does not turn on | `open` | `high` |
| 2 | Broken chair in the lab | `in_progress` | `medium` |
| 3 | Wi-Fi drops in the library | `open` | `low` |

> Los ids los asigna PostgreSQL (`IDENTITY`), por lo que en ejecución pueden variar según el
> estado de la base; se usa el id de la solicitud recién creada como referencia.

## Casos (8 de la clase + 4 propios)

| # | Caso | Estado previo | Petición / acción | Resultado esperado | Resultado observado |
| - | ----- | ------------- | ----------------- | ------------------ | ------------------- |
| 1 | Conectar correctamente | Proyecto activo | `npm run db:check` | Éxito: conexión establecida, sin secretos | |
| 2 | Crear solicitud | — | `POST /requests` | `201 Created`, `status=open`, `priority=medium`, fechas de la base | |
| 3 | Persistencia tras reinicio | Solicitud creada | Reiniciar Express → `GET /requests/:id` | `200 OK` con los **mismos** datos | |
| 4 | Filtrar sin resultados | — | `GET /requests?status=closed&priority=high` | `200 OK []` | |
| 5 | Transición inválida | `open` | `PATCH /requests/{id}` `{"status":"closed"}` | `409 INVALID_STATUS_TRANSITION` | |
| 6 | Consultar historial | Tras una transición | `GET /requests/{id}/history` | `200 OK` con eventos cronológicos | |
| 7 | Falla del historial (rollback) | Estado previo | Provocar fallo en `insertStatusHistory` dentro de la transacción | Rollback: al consultar, `requests` intacta | |
| 8 | Base no disponible | Pool caído | Cualquier consulta | Error consistente `503 DATABASE_UNAVAILABLE`, sin secretos | |
| 9 | Crear sin título | — | `POST /requests` `{"description":"..."}` | `400 MISSING_TITLE` | |
| 10 | PATCH registra evento en historial | `open` | `PATCH /requests/{id}` `{"status":"in_progress"}` → `GET .../history` | `200` y el historial tiene nacimiento + la nueva transición | |
| 11 | Historial de solicitud inexistente | — | `GET /requests/999/history` | `404 REQUEST_NOT_FOUND` | |
| 12 | Filtro con valor desconocido | — | `GET /requests?status=abierta` | `400 INVALID_STATUS` | |

### Casos propios (min 4) — justificación

* **Caso 9** (`400 MISSING_TITLE`): verifica que la validación de contrato sobrevive al
  store persistente.
* **Caso 10** (historial tras PATCH): demuestra que cada transición **escribe** su evento,
  no solo que se puede leer el seed.
* **Caso 11** (`404` en history): el endpoint nuevo debe distinguir "sin historial" de
  "recurso inexistente".
* **Caso 12** (`400 INVALID_STATUS` en filtro): mantiene la regla de clase 3 de contrato.

## Evidencia obligatoria (fase 6)

### Persistencia: antes / reinicio / después

```
POST /requests { "title": "Evidence request" }        → 201 Created, { "id": N }
# Detener Express (Ctrl+C) y arrrancarlo de nuevo
GET  /requests/N                                       → 200 OK, mismos datos (id, title, fechas)
```

La evidencia textual muestra la línea `HTTP/1.1 201` y la posterior `HTTP/1.1 200` con los
mismos datos.

### Rollback

```
# Fallo controlado en el segundo INSERT de la transacción (historial)
PATCH/POST ...                                        → respuesta de error (500/409 según el fallo)
SELECT id, title, status FROM requests WHERE ...      → la solicitud NO quedó creada (o no cambió)
```

La evidencia textual muestra la respuesta de error y la consulta posterior demostrando que
`requests` quedó intacta.

## Regla de evidencia sin secretos

Ningún volcado debe incluir la URL `postgresql://...` ni la contraseña. Se muestra: comando
exitoso, nombre de la base, tablas y resultados de consultas.