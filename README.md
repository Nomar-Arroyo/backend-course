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

## Estado de las entregas

| Entrega | Estatus | Observaciones |
| ------- | ------- | ------------- |
| 01 · El viaje de una petición | ✅ Entregada en tiempo | Tag `class-01-submission` |
| 02 · HTTP como contrato | ✅ Entregada en tiempo | Tags `class-02-lite-analysis` y `class-02-submission` |
| 03 · Recursos, estado y reglas | ✅ Entregada en tiempo | Tags `class-03-design` (marca de diseño) y `class-03-submission`; matriz verificada con `curl` |
| 04 · De SQL al backend persistente | ✅ Entregada en tiempo | Tags `class-04-design` (marca de diseño) y `class-04-submission`; PostgreSQL en Supabase, matriz de 12 casos verificada con `curl` (persistencia y rollback) |

## Reglas del curso que se respetan aquí

- Commits descriptivos y progresivos; la entrega sigue siendo distinguible por su tag.
- Las correcciones posteriores no borran la etiqueta de la entrega original.
- La IA puede proponer, pero nunca decide en silencio ni sustituye la comprensión: cada
  carpeta documenta qué se aceptó, qué se rechazó y cómo se verificó (`AI usage`).
- No se reescribe el historial ni se usa `force push`.
