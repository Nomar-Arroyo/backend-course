# Request API — starter de la Clase 4

Este proyecto es la Request API **tal como cerró la entrega 03** (módulo con array en
memoria), más las piezas nuevas de infraestructura ya preparadas. Tu trabajo de la semana:
convertirla en un backend persistente **sin romper el contrato HTTP**.

Si tu propio proyecto de la entrega 03 está sano, **continúa sobre el tuyo** y toma de aquí
solo las piezas nuevas (`database/`, `scripts/`, `src/database/`, `.env.example`).

## Qué viene listo y qué es tu trabajo

| Pieza                                   | Estado          |
| --------------------------------------- | --------------- |
| `src/database/pool.js`                  | Completo        |
| `scripts/check-database.js` (`db:check`)| Completo        |
| `database/migrations/001_…requests.sql` | Completa        |
| `database/migrations/002_…history.sql`  | **Guiada (TODOs)** |
| `database/seed.sql`                     | Completo        |
| `src/database/transaction.js`           | **Tu trabajo** (contrato en el archivo) |
| `src/modules/requests/requests.store.js`| **Tu trabajo**: migrar de array a SQL |
| `src/modules/requests/requests.service.js` | **Tu trabajo** (esqueleto con contratos) |
| `src/modules/requests/request.mapper.js`| **Tu trabajo** (contrato en el archivo) |
| `src/modules/requests/requests.routes.js`| **Tu trabajo**: async + history + errores |
| `src/modules/requests/request-status.js`| Completo — no cambia |

## Puesta en marcha (fase 2 de la entrega)

1. **Supabase**: crea tu proyecto individual (`backend-course`), guarda la contraseña y
   copia la cadena de **Session pooler (puerto 5432)** desde Connect.
2. **Variables**:

   ```bash
   cp .env.example .env
   # edita .env y coloca tu cadena. .env está en .gitignore: nunca se sube.
   npm install
   npm run db:check   # debe imprimir la base y la versión — nunca la URL
   ```

3. **Esquema**: en el SQL Editor de Supabase ejecuta, en orden:
   `database/migrations/001_create_requests.sql`, luego tu `002` completada, luego
   (opcional) `database/seed.sql`.

## Orden de implementación sugerido (fase 3)

1. Completa la migración `002` (sus TODOs salen de tu `transition-map.md`).
2. `request.mapper.js` y las funciones de lectura del store (`findAll`, `findById`);
   convierte los handlers de lectura a async y verifica con `curl`.
3. `withTransaction` en `src/database/transaction.js`.
4. `createRequest` en el service: inserción + historia `NULL → open` en una unidad.
5. `patchRequest`: leer estado actual, validar transición, actualizar + historia, todo con
   el mismo cliente.
6. `GET /requests/:id/history`.
7. Traducción de errores (400/404/409/500/503) sin filtrar secretos.

## La prueba que define la entrega

```bash
curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" \
  -d '{ "title": "Survives restarts" }'
# Ctrl+C, node src/server.js, y…
curl -i http://localhost:3000/requests/<id>   # 200: los datos sobrevivieron
```

## Reglas que la revisión verifica

* Consultas **parametrizadas** siempre; nada de valores interpolados en el SQL.
* Un solo pool; clientes liberados en `finally`.
* La transacción usa **un solo cliente** (nunca `pool.query()` dentro de la unidad).
* Respuestas en camelCase vía mapper; ninguna fila cruda.
* `.env` fuera del repositorio; evidencia sin la URL completa.
* El contrato de la clase 3 intacto; `DELETE` sigue sin existir (decisión 001).
* Sin ORM, sin `supabase-js`, sin acceso desde el frontend.
