# Class 08 evidence — para el checkpoint de la PRÓXIMA clase

El tema 8 NO se evalúa hoy: primero se aprende y se practica. Al comenzar
la próxima clase ejecutarás un checkpoint breve SOLO del tema 8. Este
archivo reúne desde ya la evidencia que ese checkpoint pedirá.

## Evidencia mínima del tema 8

* Baseline anterior al refactor (commit `class-08-baseline`): `4ca0f38`
* Commits separados de refactor y feature (`class-08-refactor`, `class-08-feature`): `1412cc5` y `131f0fc`
* `responsibility-map.md` completo: sí (`activities/class-08/responsibility-map.md` — handler `GET /:id/history` líneas 38-97, 6 categorías, 6 razones de cambio, 5 duplicaciones)
* Separación route/service/store/policy: la route solo parsea el id y responde (`parseIdParam`); el service coordina el caso (`getHistory`, `claimRequest`) y traduce la política en HTTP; el store solo consulta/escribe SQL parametrizado (`findById`, `findHistory`, `assignRequest`); la policy decide permisos y reglas puras (`canViewHistory`, `canClaimRequest`); el mapper modela el shape público (`mapRequestRow`, `mapHistoryEventRow`)
* Migración de assignment aplicada (005): `npm run db:migrate` → `[SKIPPED] 001..004 · [SKIPPED] 005_add_request_assignment.sql (aplicada previamente en la clase 08, baseline) · No pending migrations`
* Endpoint claim funcionando: `POST /requests/:id/claim` probado en `test/requests-claim.test.js` (8 casos: 401 sin auth · 403 requester · 200 agente con `assignedTo`=su id y `status: in_progress` · 404 inexistente · 409 REQUEST_ALREADY_ASSIGNED · 409 estado terminal · 400 SERVER_CONTROLLED_FIELD si `assignedTo` llega en el body · evento en el historial) y en el validador checks [03/12]-[10/12]
* Historial y transacción consistentes: el claim escribe la asignación (`assigned_to`) y el evento `request_claimed` (open→in_progress) en la MISMA transacción (`withTransaction`), igual que `createRequest` inserta solicitud + evento de nacimiento; si una escritura falla, ambas revierten — la prueba "history event is created" lo verifica
* Pruebas de policy (sin HTTP) y de API: `test/request-policy.test.js` (5 casos sobre `canClaimRequest`: rol no-agente → NOT_AGENT · ya asignada → ALREADY_ASSIGNED · los 4 estados no-open → NOT_OPEN · y regla de rol gana) y `test/requests-claim.test.js` (8 casos de API). Suite completa: `node --test --test-concurrency=1 test/*.test.js` → 52 pass / 0 fail / 0 todo
* Resultado del validador: `FINAL RESULT: PASSED` (12/12) → `activities/class-08/validation-evidence.txt` (`npm run validate:class-08`)

## Explicación integradora (bórrala de memoria: escríbela con el proyecto abierto)

> Explica qué parte de tu trabajo fue refactor y cuál fue nueva
> funcionalidad. Ubica una regla en policy, una coordinación en service,
> una operación SQL en store y explica cómo las pruebas demostraron que el
> comportamiento anterior se conservó.

Refactor fue extraer del handler de `GET /:id/history` la orquestación a
`requests.service.js` (getHistory) y devolver a su capa lo que estaba
duplicado: SQL a `requests.store.js`, visibilidad a `request.policy.js`
(canViewHistory) y shape a `request.mapper.js`; la ruta quedó delgada con
parseIdParam. La funcionalidad NUEVA fue FEATURE-801: `POST /:id/claim`
con policy `canClaimRequest` (regla: solo agente, request open y sin
asignar; el rol gana antes), service `claimRequest` (rechaza `assignedTo`
del body, abre transacción, valida policy, hace la operación y registra el
evento) y store `assignRequest` (UPDATE ... RETURNING sobre `assigned_to`
nueva en la migración 005). Que el refactor conservó conducta se demostró
con la suite en verde después de CADA paso (39/0) y con la misma ruta,
mismo 200 y mismo body de eventos; que la feature sirve al contrato se
demostró con 13 pruebas nuevas y el validador 12/12 PASSED, que además
verifica las fronteras: la ruta sin SQL y el service sin Express.