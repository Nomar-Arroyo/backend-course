# Class 06 work log

## Environment

What did I configure?
Which command confirmed that it worked?

- Copié `p.roject/.env.example` a `.env` y completé `DATABASE_URL` (Transaction
  pooler de Supabase, puerto 6543 con `?pgbouncer=true`) y `JWT_SECRET`
  generado con `npm run generate:secret`. El Session pooler (5432) reseteaba la
  conexión (`ECONNRESET`), igual que en la clase 05.
- `npm install` + `npm run db:migrate` (idempotente: segunda ejecución
  `[SKIPPED]` todas) + `npm run db:seed`.
- Confirmado con `npm run class-06:doctor` → `Environment ready.` y 10/10 PASS.

## Request flow

Where does the request enter?
Where is authentication checked?
Where is authorization checked?
Where is PostgreSQL accessed?

- Entra por `src/app.js`: CORS → `express.json()` → routers.
- `/requests` está montada en `app.js` detrás del middleware `authenticate`
  (src/middleware/authenticate.js), que valida el JWT y construye `req.auth`;
  sin token válido responde 401 y el router nunca corre.
- Autorización: `request.policy.js` (agente ve todo; requester solo lo propio),
  invocada desde `requests.service.js`. Para la nueva ruta se reutiliza
  `canViewHistory` (misma política de «view»).
- PostgreSQL: solo `requests.store.js` (queries parametrizadas); cada operación
  de escritura es una transacción vía `withTransaction`.

## Bug fixed

What was happening?
What should happen?
Which file did I modify?
Which test protects the behavior?

- `GET /requests?status=closed` con un filtro válido sin coincidencias
  respondía `404 REQUEST_NOT_FOUND`.
- Debe responder `200` con `[]`: una colección filtrada vacía no es un recurso
  faltante; `404` queda reservado para recursos individuales (clase 3).
- Modifiqué `src/modules/requests/requests.service.js` (`listRequests`): se
  elimina el `throw` cuando no hay filas y se devuelve el arreglo vacío.
- Test de regresión: "a valid filter with zero matches answers 200 with an
  empty array (regression BUG-106)" en `test/requests.test.js`.

## Feature implemented

What does GET /requests/:id/history do?
Who can use it?
How is the result ordered?

- Devuelve el historial de cambios de una solicitud como arreglo de eventos
  (`id`, `type`, `fromStatus`/`toStatus` o `fromPriority`/`toPriority`,
  `createdAt`), usando el mapper `mapHistoryEventRow` (cada evento expone solo
  sus propios campos; `changed_by` queda interno).
- El dueño (requester) sobre solicitudes propias; cualquier agente. Un
  requester ajeno recibe el mismo `404 REQUEST_NOT_FOUND` que una solicitud
  inexistente (no se revela existencia). Sin token, `401`. Una solicitud sin
  eventos devuelve `200 []`.
- Orden: más antiguos primero, con `id` como desempate estable cuando dos
  eventos comparten timestamp (`ORDER BY created_at, id` en `findHistory`).
- Implementación: `getRequestHistory` en `requests.service.js` (reutiliza
  `canViewHistory` y `findHistory`) y ruta `GET /:id/history` en
  `requests.routes.js` (declarada antes de `GET /:id`).

## Test explained

Choose one test.
What data does it prepare?
What action does it perform?
What does it check?
Which rule does it protect?

- Elegí el test de regresión de BUG-106 (en `test/requests.test.js`).
- Prepara: un usuario nuevo de pruebas (email único con `runId`) y su token.
- Acción: `GET /requests?status=closed` con ese token (usuario sin solicitudes,
  filtro válido sin coincidencias).
- Verifica: `status === 200` y cuerpo `deepEqual []`.
- Protege la regla: colección vacía ≠ recurso faltante (no 404) y los filtros
  válidos nunca disparan `REQUEST_NOT_FOUND`.

## AI assistance

What did AI help me understand?
What code did it help produce?
What did I verify myself?
What suggestion was incorrect or incomplete?

- Me ayudó a ubicar la causa del bug en `listRequests` y a entender la
  distinción colección vacía vs recurso faltante, y el flujo de autorización
  por capas (ruta → servicio → policy → store).
- Produjo: el cambio mínimón en `listRequests`, el servicio `getRequestHistory`,
  la ruta `GET /:id/history` y el test de regresión.
- Verifiqué yo mismo: reproduje el 404 con el seed (`ana`), confirmé `200 []`
  tras el fix, validé `401`/`404` de contratos adyacentes y corrí
  `npm run validate:class-06` hasta `FINAL RESULT: PASSED`.
- Sugerencia incompleta: inicialmente la ruta `/:id/history` se colocó tras
  `/:id`; fue necesario declararla antes para que Express no la capturara como
  `:id`. Es un matiz de orden de rutas, no de la lógica de negocio.

## Remaining doubt

What part do I still not understand?

- Matices del order de coincidencia de Express entre rutas paramétricas
  (`/:id` vs `/:id/history`) y cómo conviene estructurarlas en proyectos más
  grandes (agrupación con `router.use` / submódulos).
- El rol exacto del `Transaction pooler` en Supabase (por qué el Session pooler
  reseteaba la conexión aquí pero no en otros entornos).