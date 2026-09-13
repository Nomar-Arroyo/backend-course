# Backend-Course

Repositorio único de la materia **Desarrollo Backend** (ITSU) — tercer trimestre.

**Estudiante:** Nomar Arroyo · `nomar.arroyo.itsu@gmail.com`

Aquí vive el progreso real del trimestre: cada actividad semanal en `activities/class-NN/`.
Nada se sube al final; una entrega que solo existe en local no está entregada.

## Descripción

Curso teórico-práctico sobre qué ocurre detrás de una aplicación web: recorrido de una
petición, HTTP y Express, diseño de APIs (recursos, contratos, estado y reglas), y en las
clases siguientes persistencia, validación, modularidad, seguridad, pruebas y
arquitectura. Stack: JavaScript · Node.js · Express · Git/GitHub.

Cada carpeta semanal incluye objetivo, instrucciones de ejecución, solución desarrollada,
evidencia reproducible, explicación conceptual, sección `AI usage` y reflexión.

## Índice de actividades

| Clase | Entrega | Contenido principal | Tag |
| ----- | ------- | ------------------- | --- |
| [01](activities/class-01/) | El viaje de una petición | Primer servidor HTTP con el módulo nativo de Node.js, ciclo petición–respuesta, falla diagnosticada | `class-01-submission` |
| [02](activities/class-02/) | HTTP como contrato | Análisis y corrección de la API Lite; construcción de la API Full con contrato HTTP | `class-02-lite-analysis` · `class-02-submission` |
| [03](activities/class-03/) | Recursos, estado y reglas | Diseño previo sin IA, máquina de estados, `PATCH`, filtros y errores unificados | `class-03-design` · `class-03-submission` |
| [04](activities/class-04/) | De SQL al backend persistente | PostgreSQL (Supabase), historial de estados, transacciones con rollback, errores sin secretos | `class-04-design` · `class-04-submission` |
| [05](activities/class-05/) | Seguridad e identidad + frontend real | Registro, hashing scrypt, login con JWT, middleware `authenticate`, propiedad y permisos (12/12); entregas 05A (interfaz `/app`) y 05B (documentación interactiva `/learn`) | `class-05-design` · `class-05-submission` |

## Instrucciones de ejecución

Se requiere **Node.js LTS** (`node --version` para verificar). Todas las API usan el
puerto 3000: detén una antes de levantar otra.

### Clase 1 — servidor HTTP (módulo nativo)

```bash
cd activities/class-01/src
node server.js
```

Rutas: `http://localhost:3000`, `/health`, `/api/info`, cualquier otra → `404`.

### Clase 2 — API Lite corregida

```bash
cd "activities/class-02/(Actividad 1) request-api-lite"
npm install
npm start
```

### Clase 2 — API Full

```bash
cd "activities/class-02/(Actividad 2) request-api-full"
npm install
npm start
```

Rutas: `GET /requests`, `GET /requests/:id`, `POST /requests`.

### Clase 3 — API de solicitudes

```bash
cd activities/class-03/project
npm install
npm start
```

Rutas: `GET /requests` (con filtros `status` y `priority`), `GET /requests/:id`,
`POST /requests`, `PATCH /requests/:id`. Los detalles están en
`docs/http-contract.md` y la verificación en `activities/class-03/test-matrix.md`.

### Clase 4 — API de solicitudes con PostgreSQL

Requiere una base en Supabase. Pasos:

```bash
cd activities/class-04/project
npm install
copy .env.example .env   # pegar el DATABASE_URL (Session pooler)
npm run db:check         # verifica conexión sin imprimir secretos
npm start
```

Las migraciones (`database/migrations/001` y `002`) y el seed (`database/seed.sql`) se
ejecutan primero en el SQL Editor de Supabase.

Rutas: `GET /requests` (con filtros `status` y `priority`), `GET /requests/:id`,
`GET /requests/:id/history`, `POST /requests`, `PATCH /requests/:id`. Detalles en
`project/docs/http-contract.md` y la verificación en `activities/class-04/test-matrix.md`.

### Clase 5 — taller de identidad (backend)

```bash
cd activities/class-05/taller/project
npm install
copy .env.example .env   # DATABASE_URL + JWT_SECRET propios
npm run validate:class-05 -- --stage setup
npm start
```

Registro público, login con JWT y scoping por rol; validación por etapas
(`register`, `password`, `login`, `authentication`, `ownership`,
`authorization`) y la prueba reina sin argumentos: `npm run validate:class-05`
(12/12).

### Clase 5 — entrega 05A (frontend `/app`)

Requisitos: backend clase 5 corriendo en `http://localhost:3000` con
`FRONTEND_ORIGIN=http://localhost:5173`.

```bash
cd activities/class-05/week-01/request-frontend-starter
npm install
copy .env.example .env   # opcional: VITE_API_URL=http://localhost:3000
npm run dev              # abrir http://localhost:5173/app/
```

Rutas del proyecto: `/app` (05A) y `/learn` (plantilla). El token de acceso se
guarda en `sessionStorage` con su mitigación XSS documentada en
`app/README.md`; el `dist/` no se commitea.

### Clase 5 — entrega 05B (`/learn` interactivo)

```bash
cd activities/class-05/week-02
npm install
npm run dev              # redirige a http://localhost:5173/learn/
```

Documentación interactiva (proyecto Vite independiente, justificado en su
`README.md`): 20 contenidos, 4 interacciones (inspector ficticio de JWT,
comparador de mecanismos, quiz, árbol de decisión) y fuentes trazables.

## Estado de las entregas

| Entrega | Estatus | Observaciones |
| ------- | ------- | ------------- |
| 01 · El viaje de una petición | ✅ Entregada | Tag `class-01-submission` |
| 02 · HTTP como contrato | ✅ Entregada | Tags `class-02-lite-analysis` y `class-02-submission` |
| 03 · Recursos, estado y reglas | ✅ Entregada | Tags `class-03-design` (marca de diseño) y `class-03-submission`; matriz verificada con `curl` |
| 04 · De SQL al backend persistente | ✅ Entregada | Tags `class-04-design` (marca de diseño) y `class-04-submission`; PostgreSQL en Supabase, matriz de 12 casos verificada con `curl` (persistencia y rollback) |
| 05A · Interfaz real de solicitudes | ✅ Entregada | Tags `class-05-design` (marca de diseño) y `class-05-submission` (entrega 05B); taller 12/12 (boss battle), frontend `week-01` sobre API real |
| 05B · El mundo de la autenticación | ✅ Entregada | `week-02/`: 20 contenidos, 4 interacciones significativas, fuentes trazables, todo ficticio |

## Reglas del curso que se respetan aquí

- Commits descriptivos y progresivos; la entrega sigue siendo distinguible por su tag.
- Las correcciones posteriores no borran la etiqueta de la entrega original.
- La IA puede proponer, pero nunca decide en silencio ni sustituye la comprensión: cada
  carpeta documenta qué se aceptó, qué se rechazó y cómo se verificó (`AI usage`).
- No se reescribe el historial ni se usa `force push`.
