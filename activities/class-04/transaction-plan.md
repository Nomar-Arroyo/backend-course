# Transaction plan — unidad de trabajo, COMMIT/ROLLBACK y cliente

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> Define la o las unidades de trabajo, sus fallos posibles, y cómo se garantiza que dos
> escrituras dependientes se confirmen (o se reviertan) como una sola.

## ¿Por qué necesitamos una transacción?

Hay operaciones que escriben en **dos tablas a la vez** y ambas deben quedar consistentes:

* **`createRequest`**: inserta en `requests` (la solicitud) **y** en
  `request_status_history` (su evento de nacimiento). Si el historial fallara después de
  insertar la solicitud, tendríamos una solicitud sin su nacimiento: estado inconsistente.
* **`patchRequest` (cuando cambia `status`)**: actualiza `requests.status` **y** inserta el
  evento en `request_status_history`. Si el historial fallara tras el UPDATE, tendríamos un
  nuevo estado sin registro: historia perdida.

La transacción hace que **ambas escrituras se confirmen juntas (COMMIT) o se reviertan
juntas (ROLLBACK)**. Nunca queda una a medias.

## La unidad de trabajo

Se usa un helper `withTransaction(work)` en `src/database/transaction.js`:

```
withTransaction(work) -> Promise<resultado>
```

Secuencia:

1. Pedir **UN** cliente al pool: `const client = await pool.connect()`.
2. `BEGIN`.
3. Ejecutar `await work(client)` — **todas** las queries del bloque deben usar ese `client`.
4. `COMMIT` y devolver el resultado.
5. En cualquier error: `ROLLBACK` (revertir no es ocultar) y relanzar la excepción.
6. `finally`: `client.release()` — siempre, éxito o fallo.

## ¿Por qué el mismo cliente?

Una transacción de PostgreSQL vive en **una conexión**. Si dentro del bloque usáramos
`pool.query()` (que toma otro cliente del pool), esa segunda consulta se ejecutaría **fuera**
de la transacción y silenciosamente escaparía del `COMMIT`/`ROLLBACK` previsto. Para que
`requests` e `request_status_history` compartan la transacción, ambas consultas deben pasar
por el mismo `client` que abrió el `BEGIN`. Por eso el store acepta un parámetro `db` y el
service le pasa el cliente de la transacción.

## Fallos posibles y qué hace la transacción

| Falla | Momento | Resultado |
| ----- | ------- | --------- |
| La base no está disponible | al pedir cliente / `BEGIN` | `503 DATABASE_UNAVAILABLE`, nada se escribe |
| `INSERT requests` falla (p. ej. violación CHECK de título/prioridad) | dentro del `work` | `ROLLBACK`, nada queda |
| `INSERT request_status_history` falla | dentro del `work` | `ROLLBACK` → la solicitud **no se creó** (o el UPDATE **no se aplicó**) |
| Todo sale bien | — | `COMMIT` → persisten ambas filas |

## Caso de rollback que demostraremos

Para probar el rollback (caso demo de la entrega), se provoca un fallo **controlado** en el
segundo INSERT de la transacción (p. ej. forzando un valor inválido en `new_status` o
haciendo fallar `insertStatusHistory`) y se observa:

1. La respuesta de error (p. ej. `500`/`409` según cómo se forzó).
2. La consulta `SELECT` posterior que demuestra que **la solicitud NO quedó creada** (o que
   **no cambió**).

Luego se revierte el cambio de prueba y se deja el código correcto.

## Release del cliente

El `client.release()` está en `finally`: garantiza que el cliente regrese al pool **siempre**,
tanto si la transacción terminó en COMMIT como en ROLLBACK como si explotó antes. Un cliente
sin liberar agota el pool y el sistema deja de responder por falta de conexiones.

## Unidades de trabajo del service

| Operación | ¿Transacción? | Qué engloba |
| --------- | ------------- | ----------- |
| `createRequest` | Sí | `insertRequest` + `insertStatusHistory` (NULL → open) |
| `patchRequest` (cambio de status) | Sí | `findById` (validar) + `updateRequest` + `insertStatusHistory` (prev → new) |
| `listRequests` / `getRequest` / `getHistory` | No (solo lectura) | una query cada una, contra el `pool` |
