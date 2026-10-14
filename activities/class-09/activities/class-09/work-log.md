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

[COMPLETAR — qué habías leído/ejecutado tú antes de preguntar.]

## What I asked

[COMPLETAR — las preguntas, resumidas.]

## What the AI proposed

[COMPLETAR]

## Evidence I checked

[COMPLETAR — archivo por archivo: qué afirmación verificaste y contra qué.]

## What I accepted

[COMPLETAR]

## What I rejected

[COMPLETAR — y por qué: esta sección vale más que la anterior.]

## What I changed

[COMPLETAR — archivos y qué cambió en cada uno.]

## How I verified it

Baseline verificado con: `npm run doctor` (7/7), `npm run db:migrate`
(001-005 SKIPPED), `npm run db:seed` (Seed completed successfully) y
`npm test` (64 pruebas: 59 pass, 5 todo, 0 fail). Detalle en la tabla y en
los bloques de arriba.

[COMPLETAR — pruebas, validator, comandos y sus resultados reales para el fix.]

## What I still cannot explain

[COMPLETAR — honesto. Alimenta la sección 9 del dossier.]
