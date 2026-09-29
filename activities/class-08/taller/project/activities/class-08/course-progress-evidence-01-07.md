# course-progress-evidence-01-07

Paquete de evidencia para el diagnóstico acumulativo 7 en 1.
Generado automáticamente — completa las secciones marcadas con [COMPLETAR] antes de ejecutar el prompt.

## Metadata

* studentId: nomar.arroyo.itsu@gmail.com
* promptVersion: ITSU-CHECKPOINT-01-07-1.0
* rubricVersion: BACKEND-01-07-R1
* generatedAt: 2026-09-29T14:39:42.211Z (EXECUTED_NOW)
* repoRoot: backend-course
* commit: 131f0fc (EXECUTED_NOW)
* repositorioRemoto: https://github.com/Nomar-Arroyo/backend-course.git (EXECUTED_NOW) — verifica que sea TU repositorio antes de continuar
* modeloUtilizado: big-pickle (opencode)

### Contexto de git (informativo, EXECUTED_NOW)

El curso se trabaja en computadoras compartidas: el historial local puede
estar incompleto o pertenecer a otra sesión sin que falte trabajo real.
Este contexto NO es evidencia requerida — la evidencia son los archivos
del repositorio remoto del estudiante y sus respuestas. La ausencia de
commits aquí no debe interpretarse como evidencia faltante.

```text
131f0fc class-08-feature: FEATURE-801 claim por capas (policy pura + service + store transaccional + route delgada); suite 52 pass / 0 todo; validador 12/12 PASSED
1412cc5 class-08-refactor: GET /:id/history por capas (route delgada + service.getHistory), contrato intacto (39 pass / 0 fail)
4ca0f38 class-08-baseline: entorno listo (starter + doctor 7/7 + migracion 005 + seed v8 + suite 39 pass 13 todo)
00f6630 class-07 cierre: actualizar README raiz con la entrega 07
1f4268c class-07-submission: implementar OPS-703 (requestId + error handler central + /health y /ready), completar pruebas de regresion (38 pass), validador PASSED y reporte de incidentes
b8e90e7 class-07-incidents-resolved: resolver INC-701 (id invalido -> 400) e INC-702 (prioridad invalida -> 400) con pruebas de regresion
182f8ac class-07-baseline: entorno listo (starter + doctor 7/7 + seed Supabase + suite 20 pass 17 todo)
92827a5 class-06 taller: agregar ticket de salida (13 preguntas resueltas)
```

## Evidencia por clase

Los archivos listados existen en el repositorio (FOUND). Un archivo de salida guardado, como validation-evidence.txt, es TEXTO: demuestra que se guardó, no que se ejecutó (NOT_VERIFIED como ejecución).

### Clase 01 — Fundamentos de backend

* FOUND: activities\class-01\README.md
* FOUND: activities\class-01\src\server.js

Extracto de activities\class-01\README.md (redactado automáticamente):

```text
# Entrega 01 — El viaje de una petición

## Objetivo

Comprender qué ocurre detrás de una aplicación web cuando un usuario realiza una acción: desde el clic en el navegador hasta la respuesta del servidor. Construir un primer servidor HTTP con Node.js usando el módulo nativo `http`, implementando rutas, respuesta con estado adecuado y logs básicos.

## Instrucciones para ejecutar

1. Asegúrate de tener Node.js instalado. Verifica con:
   ```bash
   node --version
   ```

2. Navega a la carpeta del servidor:
   ```bash
   cd src
   ```

3. Ejecuta el servidor:
   ```bash
   node server.js
   ```

4. Abre el navegador y visita:
   - `http://localhost:3000` — Página de bienvenida
   - `http://localhost:3000/health` — Estado del servidor
   - `http://localhost:3000/api/info` — Información en formato JSON
   - `http://localhost:3000/ruta-inexistente` — Respuesta 404

5. Para detener el servidor, presiona `Ctrl + C` en la terminal.
[... 147 líneas más]
```

### Clase 02 — HTTP y contratos

* FOUND: activities\class-02\(Actividad 1) request-api-lite\README.md
* FOUND: activities\class-02\(Actividad 1) request-api-lite\lite-analysis.md
* FOUND: activities\class-02\(Actividad 1) request-api-lite\package-lock.json
* FOUND: activities\class-02\(Actividad 1) request-api-lite\package.json
* FOUND: activities\class-02\(Actividad 1) request-api-lite\server.js
* FOUND: activities\class-02\(Actividad 2) request-api-full\README.md
* FOUND: activities\class-02\(Actividad 2) request-api-full\docs\http-contract.md
* FOUND: activities\class-02\(Actividad 2) request-api-full\package-lock.json
* FOUND: activities\class-02\(Actividad 2) request-api-full\package.json
* FOUND: activities\class-02\(Actividad 2) request-api-full\src\app.js
* FOUND: activities\class-02\(Actividad 2) request-api-full\src\data\requests.js
* FOUND: activities\class-02\(Actividad 2) request-api-full\src\routes\requests.routes.js
* … 23 archivo(s) más con el mismo patrón

Extracto de activities\class-02\(Actividad 2) request-api-full\docs\http-contract.md (redactado automáticamente):

```text
# Contrato HTTP — Request API Full

## Recurso

Una **solicitud** (`request`) representa un reporte de mantenimiento enviado por un usuario. Contiene un título, una descripción, un estado de seguimiento y una prioridad. Las solicitudes se almacenan en memoria y se identifican de forma única por un `id` numérico.

### Forma del recurso

| Campo         | Tipo    | Obligatorio | Quién lo asigna | Notas |
| ------------- | ------- | ----------- | --------------- | ----- |
| `id`          | number  | Sí          | El servidor     | Se asigna automáticamente al crear. Incremental. |
| `title`       | string  | Sí          | El cliente      | No puede estar vacío. |
| `description` | string  | No          | El cliente      | Descripción detallada del problema. |
| `status`      | string  | Sí          | El servidor     | Siempre inicia como `"open"` al crear. |
| `priority`    | string  | No          | El cliente      | `"high"`, `"medium"` o `"low"`. |

---

## Endpoint 1 — Listar solicitudes

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | `GET` |
| Ruta                  | `/requests` |
| Entrada               | Ninguna |
| Respuesta de éxito    | `200 OK` con arreglo JSON de solicitudes |
| Respuestas de error   | Ninguna (devuelve arreglo vacío `[]` si no hay datos) |

**Ejemplo de respuesta**

[... 102 líneas más]
```

Extracto de activities\class-02\(Actividad 1) request-api-lite\README.md (redactado automáticamente):

```text
# Request API Lite

Una API pequeña construida con Express que administra **solicitudes de mantenimiento**.
Todo vive en un solo archivo (`server.js`) y los datos se guardan en memoria: cada vez que
reinicias el servidor, la lista vuelve a su estado inicial.

Cada solicitud tiene esta forma:

```json
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "open",
  "priority": "high"
}
```

## Requisitos

* Node.js 18 o superior (`node --version`).
* Conexión a internet la primera vez, para instalar Express.

## Instalación

Ubícate en la carpeta del proyecto e instala las dependencias:

```bash
cd request-api-lite
npm install
[... 57 líneas más]
```

### Clase 03 — Recursos, estado y reglas

* FOUND: activities\class-03\README.md
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\SOLUCION.md
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\docs\decisions\001-cancel-instead-of-delete.md
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\docs\http-contract.md
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\package.json
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\src\app.js.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\src\modules\requests\request-status.js.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\src\modules\requests\requests.routes.js.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\src\modules\requests\requests.store.js.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-03\activity resources\request-api-v3-solucion\src\server.js.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-03\activity resources\request-api-v3-starter\README.md
* FOUND: activities\class-03\activity resources\request-api-v3-starter\docs\http-contract.md
* … 22 archivo(s) más con el mismo patrón

Extracto de activities\class-03\resource-model.md (redactado automáticamente):

```text
# Resource model — Request

> Fase 1 · se completa **antes de usar IA y antes de tocar código**.
> No toda palabra del requerimiento se convierte en ruta o campo: parte del trabajo es
> decidir qué entra, qué espera y qué se pregunta.

## Nombre del recurso

**Request** — una solicitud o reporte de mantenimiento del plantel.

> "Una Request representa un incidente o necesidad de mantenimiento reportado por un
> usuario del plantel que requiere evaluación y resolución por parte del personal técnico."

## Propiedades

| Propiedad | Tipo | Ejemplo |
| --------- | ---- | ------- |
| `id` | number | `1` |
| `title` | string | `"Projector does not turn on"` |
| `description` | string | `"The projector in room 204 shows no image during class."` |
| `status` | string (enum) | `"open"` |
| `priority` | string (enum) | `"medium"` |
| `createdAt` | string (ISO 8601) | `"2026-08-28T14:00:00.000Z"` |
| `updatedAt` | string (ISO 8601) | `"2026-08-28T14:00:00.000Z"` |

## Campos requeridos

* **`title`**: una solicitud sin título no comunica qué falla. Su ausencia se rechaza con
  `400`.

[... 46 líneas más]
```

Extracto de activities\class-03\README.md (redactado automáticamente):

```text
# Entrega 03 — Recursos, estado y reglas

## Objetivo

Pasar de "tres rutas que funcionan" a una API coherente: un modelo de recurso, un contrato
HTTP y reglas que protegen el sistema cuando los datos y las operaciones empiezan a crecer.
Esta entrega cubre diseño previo (sin IA), máquina de estados, `PATCH`, filtros y un formato
de error unificado.

## Estructura

```
activities/class-03/
├── README.md
├── resource-model.md        (fase 1 · diseño sin IA)
├── http-contract.md         (fase 1 · diseño sin IA)
├── transition-map.md        (fase 1 · diseño sin IA)
├── test-matrix.md           (fase 1: esperados · fase 5: observados)
├── ai-usage.md              (fase 3 · uso de IA con contrato)
└── reflection.md            (fase 5 · reflexión)
```

El proyecto transversal de esta entrega vive en `activities/class-03/project/`.

## Fases

1. **Diseño sin IA** — modelo, contrato, máquina de estados y matriz completos antes de
   escribir código ni consultar IA. Se marca con el commit y tag `class-03-design`.
2. **Implementación** — migración a `modules/requests/`, `request-status.js` con la máquina
   de estados, `PATCH /requests/:id` con `409`, filtros combinables y formato de error
[... 16 líneas más]
```

### Clase 04 — PostgreSQL y persistencia

* FOUND: activities\class-04\README.md
* FOUND: activities\class-04\activity resources\request-api-v4-starter\.gitignore
* FOUND: activities\class-04\activity resources\request-api-v4-starter\README.md
* FOUND: activities\class-04\activity resources\request-api-v4-starter\database\migrations\001_create_requests.sql
* FOUND: activities\class-04\activity resources\request-api-v4-starter\database\migrations\002_create_request_status_history.sql
* FOUND: activities\class-04\activity resources\request-api-v4-starter\database\seed.sql
* FOUND: activities\class-04\activity resources\request-api-v4-starter\docs\decisions\001-cancel-instead-of-delete.md
* FOUND: activities\class-04\activity resources\request-api-v4-starter\docs\http-contract.md
* FOUND: activities\class-04\activity resources\request-api-v4-starter\package.json
* FOUND: activities\class-04\activity resources\request-api-v4-starter\scripts\check-database.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-04\activity resources\request-api-v4-starter\src\app.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-04\activity resources\request-api-v4-starter\src\database\pool.txt — salida guardada, NOT_VERIFIED como ejecución
* … 39 archivo(s) más con el mismo patrón

Extracto de activities\class-04\README.md (redactado automáticamente):

```text
# Entrega 04 — De SQL al backend persistente

## Objetivo

Llevar la API de solicitudes que vivía en memoria a una base de datos real. El estado deja
de ser un array en el proceso Node: pasa a **PostgreSQL** (Supabase), se conserva el
historial de cada cambio de estado (estado → antecedentes) y las escrituras que tocan dos
tablas se protegen con **transacciones**. Además se exige conectar, consultar y evidenciar
el trabajo contra la base, sin filtraciones de secretos.

## Estructura

```
activities/class-04/
├── README.md
├── data-model.md             (fase 1 · diseño sin IA)
├── persistence-contract.md   (fase 1 · diseño sin IA)
├── query-matrix.md           (fase 1 · diseño sin IA)
├── transaction-plan.md       (fase 1 · diseño sin IA)
├── error-map.md              (fase 1 · diseño sin IA)
├── test-matrix.md            (fase 1: esperados · fase 6: observados)
├── ai-usage.md               (fase 4 · uso de IA con contrato)
└── reflection.md             (fase 6 · reflexión)
```

El proyecto de esta entrega vive en `activities/class-04/project/`. La base de referencia
(no modificada) está en `activity resources/request-api-v4-starter/`.

## Fases

[... 28 líneas más]
```

### Clase 05 — Autenticación y autorización

* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\.gitignore
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\README.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\README.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\access-matrix.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\ai-usage.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\auth-contract.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\decision-log.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\reflection.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\threat-cases.md
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\validation-evidence.md — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\database\migrations\001_create_requests.sql
* FOUND: activities\class-05\taller\activity-resources\request-api-v5-starter\database\migrations\002_create_request_status_history.sql
* … 102 archivo(s) más con el mismo patrón

Extracto de activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\auth-contract.md (redactado automáticamente):

```text
# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

## POST /auth/register

## POST /auth/login

## GET /auth/me

## Semántica de errores

¿Cuándo responde tu API `401`? ¿Cuándo `403`? ¿Cuándo `404` aunque el recurso
exista? ¿Cuándo `409`? Escribe el criterio, no solo ejemplos.

```

Extracto de activities\class-05\taller\activity-resources\request-api-v5-starter\activities\class-05\validation-evidence.md (redactado automáticamente):

```text
# Evidencia de validación — Clase 05

Pega aquí la salida del validador al cerrar cada estación (SIN secretos: el
validador ya evita imprimirlos, no agregues capturas de tu `.env`).

## stage setup

## stage access-design

## stage register

## stage password

## stage login

## stage authentication

## stage ownership

## stage authorization

## Boss battle (integral)

```

### Clase 06 — Onboarding y pruebas

* FOUND: activities\class-06\taller\project\.gitignore
* FOUND: activities\class-06\taller\project\README.md
* FOUND: activities\class-06\taller\project\activities\class-06\README.md
* FOUND: activities\class-06\taller\project\activities\class-06\validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-06\taller\project\activities\class-06\work-log.md
* FOUND: activities\class-06\taller\project\database\migrations\001_create_users.sql
* FOUND: activities\class-06\taller\project\database\migrations\002_create_requests.sql
* FOUND: activities\class-06\taller\project\database\migrations\003_create_request_history.sql
* FOUND: activities\class-06\taller\project\database\migrations\004_add_constraints_and_indexes.sql
* FOUND: activities\class-06\taller\project\package-lock.json
* FOUND: activities\class-06\taller\project\package.json
* FOUND: activities\class-06\taller\project\recovery\README.md
* … 42 archivo(s) más con el mismo patrón

Extracto de activities\class-06\taller\project\activities\class-06\work-log.md (redactado automáticamente):

```text
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
[... 82 líneas más]
```

Extracto de activities\class-06\taller\project\activities\class-06\validation-evidence.txt (redactado automáticamente):

```text
CLASS 06 FINAL VALIDATION

Environment
[01/12] Database is reachable .............. PASS
[02/12] Migrations are complete ............ PASS
[03/12] Seed data is available ............. PASS

Regression
[04/12] Valid empty collection returns 200 .. PASS
[05/12] Empty collection returns [] ........ PASS

History endpoint
[06/12] Authentication is required ......... PASS
[07/12] Owner can read history ............. PASS
[08/12] Stranger cannot read history ....... PASS
[09/12] Agent can read history ............. PASS
[10/12] Missing request returns 404 ........ PASS
[11/12] Events are ordered correctly ....... PASS
[12/12] Sensitive information is hidden .... PASS

Cleanup
Temporary validation data removed successfully.

FINAL RESULT: PASSED
```

### Clase 07 — Diagnóstico y errores

* FOUND: activities\class-07\taller\project\.gitignore
* FOUND: activities\class-07\taller\project\README.md
* FOUND: activities\class-07\taller\project\activities\class-07\README.md
* FOUND: activities\class-07\taller\project\activities\class-07\incident-report.md
* FOUND: activities\class-07\taller\project\activities\class-07\validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities\class-07\taller\project\database\migrations\001_create_users.sql
* FOUND: activities\class-07\taller\project\database\migrations\002_create_requests.sql
* FOUND: activities\class-07\taller\project\database\migrations\003_create_request_history.sql
* FOUND: activities\class-07\taller\project\database\migrations\004_add_constraints_and_indexes.sql
* FOUND: activities\class-07\taller\project\incidents\INC-701-invalid-request-id.md
* FOUND: activities\class-07\taller\project\incidents\INC-702-invalid-priority.md
* FOUND: activities\class-07\taller\project\incidents\OPS-703-untraceable-errors.md
* … 51 archivo(s) más con el mismo patrón

Extracto de activities\class-07\taller\project\activities\class-07\incident-report.md (redactado automáticamente):

```text
# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

`npm run class-07:doctor` → **Environment ready for incident response.** los 7 checks en PASS (entorno, conexión a la base, migraciones, seed, app, test runner, fixtures de incidentes).
`npm run db:migrate` (dos veces) → sin pendientes; las migraciones 001-004 ya estaban aplicadas de la clase 06 y el seed estaba presente (heredado del taller anterior).
`npm test` → **20 pass / 17 todo.** Los 20 existentes protegen el contrato de las clases 3-6; los 17 `todo` son los stubs que hay que convertir en pruebas reales mientras se resuelven los incidentes.
`npm run incidents:reproduce` reprodujo los tres incidentes antes de tocar código: INC-701 → 500, INC-702 → 500, OPS-703 → header/body sin requestId.

## Incident 701

### Report

"Some request identifiers return an internal server error." Un integrador arma enlaces hacia solicitudes y algunos devuelven 500; "a veces funciona y a veces no".

### Reproduction

`GET /requests/not-a-number` con token válido de cualquier usuario (`ana.requester.seed@example.test`).

### Expected result

`400` con `error.code === "INVALID_REQUEST_ID"` y mensaje "Request id must be a positive integer." El valor debe rechazarse: texto, decimales, cero, negativos y `12abc`; un id bien formado pero inexistente sigue siendo `404`.

### Actual result

`500 Internal Server Error`. El terminal del servidor mostraba el error técnico de PostgreSQL: mensaje de sintaxis inválida para `bigint` al pasar `NaN` a la consulta.

[... 122 líneas más]
```

Extracto de activities\class-07\taller\project\activities\class-07\validation-evidence.txt (redactado automáticamente):

```text
�� 
 >   c l a s s - 0 7 - r e q u e s t - a p i @ 7 . 0 . 0   v a l i d a t e : c l a s s - 0 7  
 >   n o d e   s c r i p t s / v a l i d a t e - c l a s s - 0 7 . j s  
  
 C L A S S   0 7   I N C I D E N T   V A L I D A T I O N  
  
 B a s e l i n e  
 [ 0 1 / 1 2 ]   E x i s t i n g   c o n t r a c t   p r e s e r v e d   . . . . . . . . . .   P A S S  
  
 I n p u t   a n d   e r r o r s  
 [ 0 2 / 1 2 ]   I n v a l i d   i d   r e t u r n s   4 0 0   . . . . . . . . . . . . . . .   P A S S  
 [ 0 3 / 1 2 ]   I n v a l i d   p r i o r i t y   r e t u r n s   4 0 0   . . . . . . . . .   P A S S  
 [ 0 4 / 1 2 ]   U n k n o w n   r e q u e s t   r e t u r n s   4 0 4   . . . . . . . . . .   P A S S  
 [ 0 5 / 1 2 ]   I n v a l i d   t r a n s i t i o n   r e t u r n s   4 0 9   . . . . . . .   P A S S  
 [ 0 6 / 1 2 ]   U n e x p e c t e d   e r r o r s   r e t u r n   5 0 0   . . . . . . . . .   P A S S  
 [ 0 7 / 1 2 ]   I n t e r n a l   d e t a i l s   r e m a i n   h i d d e n   . . . . . . .   P A S S  
  
 T r a c e a b i l i t y  
 [ 0 8 / 1 2 ]   R e s p o n s e   c o n t a i n s   r e q u e s t   i d   . . . . . . . . .   P A S S  
 [ 0 9 / 1 2 ]   L o g   c o n t a i n s   t h e   s a m e   r e q u e s t   i d   . . . . .   P A S S  
 [ 1 0 / 1 2 ]   A u t h o r i z a t i o n   h e a d e r   i s   n o t   l o g g e d   . . .   P A S S  
  
 O p e r a t i o n  
 [ 1 1 / 1 2 ]   H e a l t h   e n d p o i n t   r e s p o n d s   . . . . . . . . . . . . .   P A S S  
 [ 1 2 / 1 2 ]   R e a d i n e s s   c h e c k s   P o s t g r e S Q L   . . . . . . . . . .   P A S S  
  
 C l e a n u p  
 T e m p o r a r y   v a l i d a t i o n   d a t a   r e m o v e d   s u c c e s s f u l l y .  
  
 F I N A L   R E S U L T :   P A S S E D  
[... 1 líneas más]
```

## Estado previo a la clase 8

* Validadores disponibles (clases 1-7): activities\class-05\taller\project\scripts\validate-class-05.js, activities\class-06\taller\project\scripts\validate-class-06.js, activities\class-07\taller\project\scripts\validate-class-06.js, activities\class-07\taller\project\scripts\validate-class-07.js, activities\class-08\taller\project\scripts\validate-class-06.js, activities\class-08\taller\project\scripts\validate-class-07.js
* Carpetas de pruebas: NOT_FOUND
* Último commit antes del taller: 131f0fc

## Cuestionario diagnóstico (responde aquí, 3-6 líneas cada una)

Sé específico: cita archivos o rutas concretas de TU proyecto cuando puedas. La extensión no suma.

### Pregunta clase 01

Describe qué ocurre desde que una petición llega al backend hasta que sale una respuesta y explica por qué el servidor debe permanecer activo.

Respuesta: El backend es un proceso Node que escucha en un puerto (`src/server.js` monta la app de `src/app.js`). La petición HTTP entra y atraviesa, en orden, los middlewares (`cors` → `request-id` → `request-logger` → `express.json` → `authenticate`) y luego el router decide qué handler ejecuta según método y ruta. El handler es delgado: valida el id en la frontera, llama al service (que aplica policy y reglas), el store corre SQL parametrizado y la respuesta vuelve con status, headers y body JSON. El servidor debe permanecer activo porque es un proceso orientado a eventos que atiende peticiones continuamente: si el proceso termina ya nadie escucha el puerto y el navegador recibe un error de conexión, no una respuesta HTTP.

### Pregunta clase 02

Elige un endpoint del proyecto y explica cómo método, ruta, body y status forman su contrato.

Respuesta: Elijo `POST /requests` (crear solicitud). El método POST expresa la intención "crear", la ruta identifica la colección de recursos y el body lleva los datos de entrada (title obligatorio, description opcional, priority low/medium/high opcional). El service respeta el contrato: title vacío → `400 TITLE_REQUIRED`, priority desconocida → `400 INVALID_PRIORITY`, y los campos controlados por el servidor (id, status, etc.) se rechazan con `400 SERVER_CONTROLLED_FIELD`. El éxito responde `201` con el recurso creado (status siempre 'open', asignado por el servidor); sin token es `401` y el 403 queda para roles no permitidos. Ese contrato está documentado en `docs/http-contract.md` (clases 02-03) y fijado por las pruebas.

### Pregunta clase 03

Explica, usando una solicitud del proyecto, la diferencia entre representación, dato inválido y transición incompatible con el estado actual.

Respuesta: Tomo la solicitud "Mi laptop no enciende" (open/high). Representación es lo que el cliente ve: el JSON camelCase (`id`, `title`, `priority`, `status`, `createdAt`…) que arma `request.mapper.js` a partir de la fila en snake_case de la BD — una vista pública, no la fila interna. Dato inválido es un valor que rompe el contrato aunque el recurso exista: enviar `priority: 'urgent'` responde `400 INVALID_PRIORITY` (se valida ANTES de tocar SQL). Transición incompatible es un `PATCH status: 'closed'` sobre una request abierta: 'closed' es un status válido, pero la máquina de estados (`request-status.js`, `canTransition`) responde `409 INVALID_STATUS_TRANSITION` por el estado ACTUAL. La decisión "cancelar en vez de borrar" (docs/decisions) convierte 'cancelled' en una transición del estado, no en un DELETE.

### Pregunta clase 04

Explica la diferencia entre migración, seed y transacción, e indica dónde aparece cada concepto en el proyecto.

Respuesta: Migración evoluciona el esquema de forma ordenada e idempotente: `database/migrations/` (001-005) con tipos, constraints, historia y hoy la columna `assigned_to`; `scripts/migrate.js` las corre una a una en transacción y registra cada nombre en `schema_migrations`, por eso una migración aplicada jamás se edita (se agrega una nueva). Seed son datos de demostración reproducibles: `scripts/seed.js` crea los usuarios `*.seed@example.test`, borra solo lo suyo y recrea las 6 solicitudes con su historial. Transacción es la unidad de trabajo que hace commit/rollback completo de varias escrituras: `src/database/transaction.js` (`withTransaction`); por ejemplo `createRequest` inserta la solicitud y su evento de nacimiento juntos, e igual el claim de la clase 08 (asignación + `request_claimed`).

### Pregunta clase 05

Explica la diferencia entre autenticación y autorización y por qué un JWT decodificado todavía debe verificarse.

Respuesta: Autenticación prueba QUIÉN eres y falla con `401`: el middleware `authenticate` (src/middleware/authenticate.js, montado sobre /requests en app.js) valida el Bearer token con `jose` y construye `req.auth`. Autorización decide QUÉ puedes hacer y falla con `403` (o `404` para no revelar recursos ajenos): `request.policy.js` decide, por ejemplo, que un requester solo ve/adminstra lo suyo y un agente ve todo. Un JWT es solo un JSON firmado: cualquiera puede decodificarlo y ver payload/expiración, así que decodificar no prueba nada. Debe verificarse la firma con el secreto conocido solo por el servidor y revisarse expiración en CADA petición; un token decodificado sin verificar podría llevar claims falsos de otro autor.

### Pregunta clase 06

Elige una prueba del proyecto, identifica preparación, acción y comprobación, y explica qué regresión protege.

Respuesta: Tomo "the owner can read the history, oldest event first" (test/requests-history.test.js). Preparación: `buildScenario()` crea owner y agente, el owner crea una solicitud y el agente hace PATCH a in_progress y a priority high (deja 3 eventos). Acción: `GET /requests/:id/history` con el token del owner. Comprobación: 200, body array de 3 eventos (nacimiento `status_changed` open, transición, `priority_changed`) ordenados del más viejo al más nuevo con id como desempate; otro test de la misma suite exige que un requester ajeno reciba exactamente el mismo 404 que una solicitud inexistente. Protege el contrato de FEATURE-206 y evita regresiones de visibilidad, orden de eventos y el "404-as-missing" de la clase 05.

### Pregunta clase 07

Describe un fallo investigado distinguiendo síntoma, hipótesis y causa; luego indica qué señal correspondería a health o readiness.

Respuesta: INC-701 ("Some request identifiers return an internal server error"). Síntoma: `GET /requests/not-a-number` devuelve 500. Hipótesis: un id mal formado llega hasta la consulta. Reproducción antes de corregir: mismo 500. Causa: no había validación del id en la frontera HTTP, el NaN entraba como parámetro y PostgreSQL (bigint) lanzaba el error técnico que el error-handler convertía en el 500 genérico. Corrección: `parseIdParam` (`src/http/parse-id.js`) valida el id COMPLETO en la ruta y responde `400 INVALID_REQUEST_ID`. Para health/readiness: `/health` = señal de que el PROCESO está vivo (liveness): responde 200 {status:ok} aunque PostgreSQL caiga; `/ready` = señal de que la DEPENDENCIA está lista (readiness): hace un `SELECT 1` real y responde 200 database:available o un `503 database:unavailable` deliberado.

---
Nota de seguridad: este paquete fue generado excluyendo .env y redactando
posibles secretos. Revisa una vez más antes de pegarlo en un modelo:
si ves una credencial real, reemplázala por [REDACTED] y avisa al docente.
