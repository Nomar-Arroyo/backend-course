# Work log

Registro del trabajo con IA durante el TALLER (la evaluación tiene su
propio historial obligatorio en assessment/). No copies conversaciones
completas aquí: registra el criterio, no el chat.

## Baseline del taller (puesta en marcha)

Registro de cada comando: qué esperaba, qué obtuve, qué me bloqueó y cómo
lo resolví. Los comandos se ejecutaron desde la raíz del proyecto
(`activities/class-09/`).

| Comando | Esperaba | Obtuve |
| --- | --- | --- |
| `git remote -v` | `origin` = mi repositorio | `https://github.com/Nomar-Arroyo/backend-course.git` (mi repo) |
| `npm install` | dependencias listas | OK |
| `npm run doctor` | 7/7 PASS | 7/7 PASS |
| `npm run db:migrate` | 001-005 SKIPPED | `[SKIPPED] 001..005`, `No pending migrations.` |
| `npm run db:seed` | resumen repetible | `Seed completed successfully.` (2 requesters, 1 agent, 6 requests, 15 history) |
| `npm test` | suite verde, los `todo` son míos | `tests 64 · pass 59 · todo 5 · fail 0` |

### Bloqueo 1 — Supabase inaccesible

El doctor fallaba en "Database connection established". El error real no
era de red genérica: al conectar obtenía `XX000 (ENOTFOUND) tenant/user
postgres.<ref> not found`, y ni `db.<ref>.supabase.co` ni
`<ref>.supabase.co` resolvían por DNS (comprobado también con DNS público
8.8.8.8). Diagnóstico: el proyecto de Supabase (el mismo desde la clase 06)
se había pausado/desprovisionado. **Resolución:** restauré el proyecto en
el dashboard hasta que quedó Active; volvió a resolver DNS y `SELECT 1`
respondió. No creé un proyecto nuevo (los datos y migraciones siguen siendo
los mismos desde la clase 06).

### Bloqueo 2 — Layout de entregables

El doctor marcaba `[07/07] Assessment kit available FAIL` y el validador
final reportaba `[03/14] Required sections exist FAIL — file missing`, aun
teniendo `system-dossier.md`. Causa: los scripts del starter resuelven los
documentos como `<raíz del proyecto>/activities/class-09/...`, igual que
las clases 06-08 (que guardan sus entregables en `taller/project/activities/class-0X/`).
Mis entregables estaban en la raíz del proyecto. **Resolución:** moví
`system-dossier.md`, `work-log.md` y `validation-evidence.txt` a
`activities/class-09/activities/class-09/`. Doctor → 7/7 y el validador ya
encuentra el dossier.

### Bloqueo 3 — Shell POSIX en Windows

`npm run validate:class-09` [13/14] (suite de regresión) fallaba en Windows
porque el validador ejecuta la suite con `shell: '/bin/bash'`, que no existe
en este equipo. Además `npm test` corría **0 pruebas** porque el script usaba
comillas simples alrededor del glob (`'test/*.test.js'`) y `cmd.exe` las pasa
literales a node. **Resolución (entorno):** hice que `/bin/bash` resuelva a un
bash real (junction `C:\bin` → `C:\Program Files\Git\usr\bin`), sin tocar el
validador. **Resolución (script):** quité las comillas simples del script
`test` de `package.json` para que el glob funcione igual en cmd y en sh.
Con eso el validador pasa [13/14] y `npm test` corre las 64 pruebas.

## Análisis de BUG-901 (antes de tocar código)

Reproducción con usuarios y una solicitud sintéticas (registrados por la
API, limpiados al terminar). Ejecutando la app en memoria contra la base
real, ANTES de cambiar nada:

```text
request id            : 316
owner    GET /:id     : 200
stranger GET /:id     : 200   (bug: debería ser 404)
no token GET /:id     : 401
stranger GET ?userId= : 200   (bug: debería ser 404)
stranger body.createdBy: <uuid del owner>   (dueño ajeno expuesto)
```

Recorrido y causa raíz quedaron en el dossier (secciones 3, 7 y 8):
`getRequest` (`src/modules/requests/requests.service.js:86-93`) devuelve
la fila mapeada SIN llamar a `canViewRequest`, mientras `getHistory`
(`:224`) y `patchRequest` (`:162`) sí la consultan. La regla
(`src/modules/requests/request.policy.js:20-23`) es correcta; el problema
es quién la consulta. Análisis de impacto completo en la sección 8 del
dossier, commiteado como `class-09-analysis` ANTES del fix.

## What I observed before asking AI

* Leí `README.md`, `tickets/BUG-901.md` y `recovery/environment.md` para
  entender el encargo y no gastar el taller en el entorno.
* Corrí el baseline completo (doctor, migraciones, seed, suite) y anoté
  que quedaban 5 pruebas en `todo` — justo las del caso "ajeno".
* Abrí `src/modules/requests/requests.service.js` y vi la asimetría:
  `getRequest` (`:86-93`) devuelve la fila mapeada SIN consultar la
  policy, con un comentario `TEMP(REQ-442)`; en cambio `getHistory`
  (`:224`) y `patchRequest` (`:162`) sí llaman `canViewRequest`.
* Reproduje el acceso indebido con usuarios y una solicitud sintéticas
  (ver arriba): el requester ajeno recibía `200`. Ese fue mi punto de
  partida, no la sospecha.

## What I asked

* Si la causa estaba en la policy (¿estaba mal la regla?) o en quién la
  consulta.
* Dónde debía ir la corrección mínima sin crear capas nuevas.
* Cómo convertir las 5 pruebas `todo` en regresiones rojas→verdes sin
  inventar infraestructura.
* Si el caso "no visible" debía ser `403` o `404`.

## What the AI proposed

* Confirmó que `canViewRequest` es correcta y pura, y que el defecto es
  que `getRequest` no la consulta; propuso el cambio mínimo en el service.
* Sugirió mapear la fila UNA vez, consultar la policy y lanzar el
  `notFound(id)` existente (mismo helper que ya usa `getHistory`).
* Recomendó convertir primero los `todo`, verlos fallar contra el bug y
  luego aplicar el fix, para dejar evidencia roja→verde.
* Insistió en NO tocar la policy, el store, las rutas ni el esquema.

## Evidence I checked

* `src/modules/requests/requests.service.js:86-93` (detalle sin policy)
  vs `:224` (historial con policy) vs `:162` (patch con policy).
* `src/modules/requests/request.policy.js:20-23` — la regla de visibilidad.
* `src/modules/requests/requests.routes.js:30` — la respuesta `200` sale
  del router; el id se valida antes en `src/http/parse-id.js:16-21`.
* `src/middleware/error-handler.js:18-24` — la categoría `resource` → 404.
* `test/request-detail.test.js` — las 9 llaves congeladas del schema, que
  mi fix no debía alterar.
* El resultado de mi reproducción manual (stranger `200`).

## What I accepted

* El fix mínimo en `getRequest`: mapear una vez, `canViewRequest` y
  `notFound(id)`. Reutiliza lo que ya existe (el ticket lo pide).
* Convertir las 5 pruebas `todo` (3 puras + 2 con base).
* Mantener el `404` para "no visible", indistinguible del inexistente.

## What I rejected

* Responder `403`: rompería la decisión de ESTE sistema (no confirmar
  existencia) y permitiría enumerar ids. El propio ticket lo dice.
* Meter el chequeo en un middleware nuevo o en la ruta: crea una capa que
  el ticket prohíbe y duplica la autorización que ya vive en la policy.
* Cambiar `request.policy.js`: está correcta; el problema no era la regla.
* Agregar una migración o un índice: el esquema no cambia.

## What I changed

* `src/modules/requests/requests.service.js` — `getRequest` ahora consulta
  `canViewRequest` y lanza `notFound(id)` si el requester no es el dueño.
* `test/request-access-policy.test.js` — 3 pruebas puras reales
  (agent/owner→true, stranger→false).
* `test/request-detail.test.js` — 2 regresiones reales (ajeno→404 e
  `?userId=`→404, ambas con code `REQUEST_NOT_FOUND`).
* `activities/class-09/activities/class-09/system-dossier.md` — dossier
  completo (inventario, recorrido, auditoría, impacto).
* `activities/class-09/activities/class-09/validation-evidence.txt` —
  salida real del validador final.
* Baseline previo (commit `class-09-baseline`): mover los documentos a
  `activities/class-09/activities/class-09/` y quitar las comillas simples
  del script `test` en `package.json`.

## How I verified it

Baseline verificado con: `npm run doctor` (7/7), `npm run db:migrate`
(001-005 SKIPPED), `npm run db:seed` (Seed completed successfully) y
`npm test` (64 pruebas: 59 pass, 5 todo, 0 fail).

Fix verificado con, en este orden:

* `npm run test:detail` ANTES del fix → rojo (2 fallos `200 !== 404`).
* `npm run test:detail` DESPUÉS del fix → verde.
* `npm run test:policy` → 8/8 (las policies no dependen de Express/DB).
* `npm test` → 64 pruebas: 64 pass, 0 fail, 0 todo.
* `npm run validate:class-09` → `FINAL RESULT: PASSED` (14/14).
* Reproducción manual: owner `200`, ajeno `404`, sin token `401`.

## What I still cannot explain

* Por qué `getRequest` quedó sin el chequeo mientras `getHistory` sí lo
  tiene; el `TEMP(REQ-442)` sugiere deuda, pero no hay ticket visible.
* Cómo se comportaría el `claim` con dos agentes concurrentes (no hay
  prueba de concurrencia; `withTransaction` no bloquea la fila).
* Si el `userId` que se registra en el log operativo debería ser opaco.
