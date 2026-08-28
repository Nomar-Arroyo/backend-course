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
| Crear correctamente    | `POST /requests` `{"title":"Broken door lock","description":"...","priority":"high"}` | —             | `201 Created`                       |                     |
| Crear sin título       | `POST /requests` `{"description":"Missing title"}`                    | —             | `400 MISSING_TITLE`                 |                     |
| Consultar inexistente  | `GET /requests/999`                                                   | —             | `404 REQUEST_NOT_FOUND`             |                     |
| Filtrar sin resultados | `GET /requests?status=closed&priority=high`                           | —             | `200 []`                            |                     |
| Cambiar prioridad      | `PATCH /requests/1` `{"priority":"low"}`                              | `open`        | `200`                               |                     |
| Transición válida      | `PATCH /requests/1` `{"status":"in_progress"}`                        | `open`        | `200`                               |                     |
| Transición inválida    | `PATCH /requests/1` `{"status":"closed"}`                             | `open`        | `409 INVALID_STATUS_TRANSITION`     |                     |
| Modificar cerrada      | `PATCH /requests/4` `{"priority":"high"}`                             | `closed`      | `409 REQUEST_IN_TERMINAL_STATUS`    |                     |

### Casos propios (mínimo dos)

| Caso                          | Petición                                                  | Estado previo | Resultado esperado          | Resultado observado |
| ----------------------------- | --------------------------------------------------------- | ------------- | --------------------------- | ------------------- |
| Filtro con valor desconocido  | `GET /requests?status=abierta`                            | —             | `400 INVALID_STATUS`        |                     |
| PATCH sin campos modificables | `PATCH /requests/1` `{"id": 1, "createdAt": "..."}`       | `open`        | `400 EMPTY_PATCH`           |                     |

> El caso de "enviar `status` al crear" (ignorado, `201`) queda cubierto por el caso de
> creación correcta en la práctica: los campos que el servidor controla se descartan sin
> errores.

## Evidencia

_(Pegar aquí, en la fase 5, las salidas de `curl -i` de al menos los casos de transición
inválida (`409 INVALID_STATUS_TRANSITION`) y de solicitud terminal
(`409 REQUEST_IN_TERMINAL_STATUS`): son la prueba de que las reglas están protegidas.)_

```text

```