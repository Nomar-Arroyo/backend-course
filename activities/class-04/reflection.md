# Reflexión — Entrega 04

> Doce preguntas para comprobar lo esencial de la clase 4. Respuestas concretas, con
> evidencia del proyecto (base `postgres` en Supabase, tablas `requests` y
> `request_status_history`, matriz verificada con `curl`).

### 1. ¿Qué cambió en el ciclo de vida de una solicitud al pasar de la memoria del proceso a la base de datos?

Antes, `requests.store.js` guardaba en un array dentro del proceso Node: al reiniciar Express
todo se perdía y los ids volvían a empezar. Ahora el estado vive en PostgreSQL: cada
solicitud tiene un `id` generado por la base (`IDENTITY`), fechas puestas por la base
(`CURRENT_TIMESTAMP`) y —nuevo— una historia de eventos. Un reinicio del proceso ya no
afecta los datos; se comprobó creando una solicitud, reiniciando Express y consultándola con
los mismos datos (`200 OK` idéntico).

### 2. ¿Cuál fue el papel de Supabase en la entrega?

Supabase es el proveedor del **PostgreSQL administrado**: el proyecto en la nube guarda la
base, y desde su panel se obtiene la cadena `DATABASE_URL` (Session pooler, puerto 5432)
para conectar la API con `pg`. También me sirvió para verificar el esquema. El proyecto
creado fue `xfywzcdzzcmeqpvwymfw` (base `postgres`, PostgreSQL 17.6).

### 3. ¿Por qué el `DATABASE_URL` nunca debe llegar al frontend?

Porque es una cadena con la **contraseña** de la base. El frontend no necesita conectarse
directamente a la base: se comunica con nuestra API por HTTP y esta traduce todo a SQL. Si
la URL llegara al navegador, cualquiera podría conectarse con credenciales de escritura,
leer y modificar datos, o agotar la base. Por eso vive solo en `project/.env` (gitignoreado)
y la evidencia de conexión nunca lo imprime (`check-database.js` solo muestra nombre de la
base y versión).

### 4. ¿Para qué sirve un pool de conexiones y por qué se libera el cliente?

Abrir una conexión TCP+autenticación a PostgreSQL por cada request es lento. El pool
reutiliza un conjunto de conexiones abiertas: cada query toma una, la usa y la devuelve.
En una transacción además el cliente es **exclusivo** de esa unidad de trabajo, y se libera
en `finally` (`client.release()`) para que no se agote el pool: un cliente sin liberar por
un error dejaría al servidor sin conexiones.

### 5. ¿Por qué las consultas usan parámetros y no concatenación?

Por dos razones. Seguridad: concatenar el input del cliente en la cadena SQL abre la puerta
a la inyección SQL. Correctitud y robustez: los parámetros (`$1`, `$2`) separan el SQL de
los valores, así `pg` los envía por su canal y los tipos se respetan. Los únicos nombres que
pueden "variar" son las columnas, y en el código son **fijas** (nunca construidas desde el
cliente), porque los identificadores SQL no se pueden parametrizar.

### 6. ¿Qué diferencia hay entre una fila de la base y la representación HTTP que se entrega?

La fila es la forma interna (`created_at`, `updated_at`, `previous_status`, `new_status`) —
los nombres de la base, con su tipo. La representación HTTP es el contrato publicado en
clase 3 (`createdAt`, `updatedAt`, `previousStatus`, `newStatus`), camelCase. Por eso existe
`request.mapper.js`: cambia fila → representación y ajusta tipos (p. ej. `id` `BIGINT` que
llega como string y se entrega como `Number`). La fila NO es la respuesta.

### 7. ¿Qué protege la base de datos y qué protege la aplicación?

La base protege la **forma**: tipos (`BIGINT`, `TIMESTAMPTZ`), obligatoriedad (`NOT NULL`),
valores cerrados (`CHECK` en `priority` y `status`), identidad (`IDENTITY`) y la integridad
referencial (FK de `request_status_history` a `requests`). La aplicación protege las
**reglas de negocio**: que no haya transiciones inválidas (`canTransition`), que un estado
terminal no se modifique, que `title` no esté vacío, y que una transacción no deje escrituras
a medias. La base no sabe que `closed → in_progress` está prohibida; la app sí.

### 8. ¿Por qué guardamos el historial de estados y no solo el estado actual?

Porque "dónde está" no responde "cómo llegó". El estado actual (`status`) es la última
página de una historia: una solicitud que está `cancelled` pudo haber sido abierta y
cancelleda al día siguiente, o reabierta dos veces. El historial (`request_status_history`)
registra cada nacimiento y cada transición con `previous_status`, `new_status` y
`changed_at`. Así `GET /requests/:id/history` responde cómo evolucionó, y se puede auditar
(caso 10 de la matriz: nacimiento `NULL→open` y luego `open→in_progress`).

### 9. ¿Qué inconsistencia evita la transacción al crear y al actualizar?

Al crear, evitamos una solicitud sin su nacimiento (si el `INSERT` de historial fallara
después del de la solicitud). Al actualizar con cambio de estado, evitamos que el estado
cambie sin registrarlo (o que el historial registre un cambio que no ocurrió). Con
`withTransaction` ambas escrituras son una sola unidad: COMMIT juntas o ROLLBACK juntas. Se
probó forzando un fallo en el segundo `INSERT` (error `23514` del CHECK): `ROLLBACK` y la
solicitud no quedó creada (requests antes=0, después=0).

### 10. ¿Por qué todas las operaciones de una transacción usan el mismo cliente?

Porque la transacción vive en **una conexión de PostgreSQL**. Si dentro del bloque usáramos
`pool.query()` (que toma otro cliente del pool), esa segunda consulta se ejecutaría fuera
de la transacción y escaparía silenciosamente del COMMIT/ROLLBACK, rompiendo la atomicidad.
Por eso el store acepta un parámetro `db` y el service le pasa el mismo `client` de la
transacción para `insertRequest` + `insertStatusHistory` (crear) y para
`findById` + `updateRequest` + `insertStatusHistory` (PATCH con cambio de estado).

### 11. ¿Qué ocurre con los datos al reiniciar Express ahora que hay persistencia?

Nada. Los datos están en PostgreSQL, no en el proceso: al reiniciar Express las solicitudes
siguen existiendo con el mismo `id`, el mismo historial y las mismas fechas. La evidencia
del caso 3 lo muestra: `POST` (201) → reinicio → `GET /requests/5` (200) con datos
idénticos. (Contraste con clase 3: el array se vaciaba y los ids recomenzaban.)

### 12. ¿Qué problema de la entrega no logramos resolver y cómo lo reconoceríamos?

El manejo de errores de **autenticación de base** (credencial incorrecta): la base responde,
por lo que no es "no disponible" (`503`), pero la conexión falla; hoy se traduce como error
genérico `500 INTERNAL_ERROR`. Lo reconoceríamos porque, con una contraseña inválida, la
API responde `500` y el log del servidor muestra un fallo de autenticación de `pg`, aunque
el cliente recibe un mensaje seguro. Una mejora sería distinguir explícitamente
"configuración incorrecta" de "fallo interno" sin exponer la causa. También quedó abierta la
pregunta de si los eventos de historial deberían registrar autor/fecha de cada cambio más
allá del `changed_at` automático.