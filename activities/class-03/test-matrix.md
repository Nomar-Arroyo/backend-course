# Test matrix — Entrega 03

> Fase 1: se declara el resultado **esperado**. Fase 5: se ejecuta cada caso con `curl`
> contra el proyecto corriendo y se registra el resultado **observado** (línea de estado
> literal y cuerpo). La columna observado se llena ejecutando, no copiando la esperada.

## Datos semilla para los casos

El store arranca con cinco solicitudes, una por cada estado, para que cada caso pueda
ejecutarse con un `id` estable y un estado previo claro:

| id | title | status | priority |
| -- | ----- | ------ | -------- |
| 1 | Projector does not turn on | `open` | `medium` |
| 2 | Broken chair in the lab | `in_progress` | `high` |
| 3 | Wi-Fi drops in the library | `resolved` | `medium` |
| 4 | Authorize new lab software | `closed` | `low` |
| 5 | Replace lab light bulbs | `cancelled` | `high` |

> Si varios casos se ejecutan en cadena sobre el mismo `id`, reiniciar el servidor (o
> reinsertar la semilla) para restablecer el estado previo declarado.

## Casos

| Caso                   | Petición                                                              | Estado previo | Resultado esperado                  | Resultado observado |
| ---------------------- | -------------------------------------------------------------------- | ------------- | ----------------------------------- | ------------------- |
| Crear correctamente    | `POST /requests` `{"title":"Broken door lock","description":"...","priority":"high"}` | —             | `201 Created`                       | `HTTP/1.1 201 Created` — id 6, `status":"open"`, `priority":"high"`, fechas generadas |
| Crear sin título       | `POST /requests` `{"description":"Missing title"}`                    | —             | `400 MISSING_TITLE`                 | `HTTP/1.1 400 Bad Request` — `{"error":{"code":"MISSING_TITLE","message":"Title is required"}}` |
| Consultar inexistente  | `GET /requests/999`                                                   | —             | `404 REQUEST_NOT_FOUND`             | `HTTP/1.1 404 Not Found` — `REQUEST_NOT_FOUND` `"Request 999 was not found"` |
| Filtrar sin resultados | `GET /requests?status=closed&priority=high`                           | —             | `200 []`                            | `HTTP/1.1 200 OK` — `[]` |
| Cambiar prioridad      | `PATCH /requests/1` `{"priority":"low"}`                              | `open`        | `200`                               | `HTTP/1.1 200 OK` — `priority":"low"`, estado sigue `open` |
| Transición válida      | `PATCH /requests/1` `{"status":"in_progress"}`                        | `open`        | `200`                               | `HTTP/1.1 200 OK` — `status":"in_progress"` |
| Transición inválida    | `PATCH /requests/1` `{"status":"closed"}`                             | `open`        | `409 INVALID_STATUS_TRANSITION`     | `HTTP/1.1 409 Conflict` — `INVALID_STATUS_TRANSITION` `"Cannot move a request from open to closed"` |
| Modificar cerrada      | `PATCH /requests/4` `{"priority":"high"}`                             | `closed`      | `409 REQUEST_IN_TERMINAL_STATUS`    | `HTTP/1.1 409 Conflict` — `REQUEST_IN_TERMINAL_STATUS` `"Request 4 is in a terminal status"` |

### Casos propios (mínimo dos)

| Caso                          | Petición                                                  | Estado previo | Resultado esperado          | Resultado observado |
| ----------------------------- | --------------------------------------------------------- | ------------- | --------------------------- | ------------------- |
| Filtro con valor desconocido  | `GET /requests?status=abierta`                            | —             | `400 INVALID_STATUS`        | `HTTP/1.1 400 Bad Request` — `INVALID_STATUS` `"\"abierta\" is not a valid status filter"` |
| PATCH sin campos modificables | `PATCH /requests/1` `{"id": 1, "createdAt": "..."}`       | `open`        | `400 EMPTY_PATCH`           | `HTTP/1.1 400 Bad Request` — `EMPTY_PATCH` `"No modifiable fields were provided"` |

> El caso de "enviar `status` al crear" (ignorado, `201`) queda cubierto por el caso de
> creación correcta en la práctica: los campos que el servidor controla se descartan sin
> errores. Verificación extra: `POST` con `{"title":"...","status":"closed"}` y sin
> `priority` → `201` con `status:"open"` y `priority:"medium"`.

## Evidencia

Salida literal de `curl -i` contra el proyecto corriendo. Los dos casos prueban que las
reglas están protegidas en el servidor.

**Transición inválida (`409 INVALID_STATUS_TRANSITION`)**

```txt
$ curl -i -X PATCH -H "Content-Type: application/json" -d '{"status":"closed"}' http://localhost:3000/requests/1

HTTP/1.1 409 Conflict
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 100
ETag: W/"64-0QWjk9bHy1vygPTgG1/iQc3FErU"
Date: Fri, 28 Aug 2026 18:35:28 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"INVALID_STATUS_TRANSITION","message":"Cannot move a request from open to closed"}}
```

**Solicitud en estado terminal (`409 REQUEST_IN_TERMINAL_STATUS`)**

```txt
$ curl -i -X PATCH -H "Content-Type: application/json" -d '{"priority":"high"}' http://localhost:3000/requests/4

HTTP/1.1 409 Conflict
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 93
ETag: W/"5d-w+dIQ/wNURdVZRIvv28uU0IA7Yw"
Date: Fri, 28 Aug 2026 18:35:28 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"REQUEST_IN_TERMINAL_STATUS","message":"Request 4 is in a terminal status"}}
```