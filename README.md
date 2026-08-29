# backend-course

Repositorio único de la materia **Desarrollo Backend** (ITSU) — tercer trimestre.

**Estudiante:** Nomar Arroyo

Aquí vive el progreso real del trimestre: cada actividad semanal en `activities/class-NN/`
y el proyecto transversal que crece clase a clase. Nada se sube al final; una entrega que
solo existe en local no está entregada.

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
| [03](activities/class-03/) | Recursos, estado y reglas | Diseño previo sin IA, máquina de estados, `PATCH`, filtros y errores unificados en el proyecto transversal | `class-03-design` · `class-03-submission` |

## Proyecto transversal

**Sistema de gestión de solicitudes** — un solo sistema que incorpora capacidades clase a
clase. En la entrega 03 vive en `activities/class-03/project/` (API con modelo de recurso,
contrato HTTP, 5 estados protegidos por máquina de estados, `PATCH` con `409`, filtros y
formato de error `{ error: { code, message } }`).

```txt
activities/class-03/project/
├── README.md
├── package.json
├── docs/
│   ├── http-contract.md
│   └── decisions/
│       └── 001-cancel-instead-of-delete.md
└── src/
    ├── app.js
    ├── server.js
    └── modules/
        └── requests/
            ├── requests.routes.js
            ├── requests.store.js
            └── request-status.js
```

> Cuando el proyecto final lo requiera, esta implementación migra a `project/` en la raíz
> y sigue creciendo (persistencia, validación, seguridad, pruebas, despliegue).

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

### Clase 3 — proyecto transversal (solicitudes)

```bash
cd activities/class-03/project
npm install
npm start
```

Rutas: `GET /requests` (con filtros `status` y `priority`), `GET /requests/:id`,
`POST /requests`, `PATCH /requests/:id`. Los detalles están en
`docs/http-contract.md` y la verificación en `activities/class-03/test-matrix.md`.

## Estado de las entregas

| Entrega | Estatus | Observaciones |
| ------- | ------- | ------------- |
| 01 · El viaje de una petición | ✅ Entregada en tiempo | Tag `class-01-submission` |
| 02 · HTTP como contrato | ✅ Entregada en tiempo | Tags `class-02-lite-analysis` y `class-02-submission` |
| 03 · Recursos, estado y reglas | ✅ Entregada en tiempo | Tags `class-03-design` (marca de diseño) y `class-03-submission`; matriz verificada con `curl` |

## Reglas del curso que se respetan aquí

- Commits descriptivos y progresivos; la entrega sigue siendo distinguible por su tag.
- Las correcciones posteriores no borran la etiqueta de la entrega original.
- La IA puede proponer, pero nunca decide en silencio ni sustituye la comprensión: cada
  carpeta documenta qué se aceptó, qué se rechazó y cómo se verificó (`AI usage`).
- No se reescribe el historial ni se usa `force push`.