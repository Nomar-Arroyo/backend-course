# Entrega 02 — HTTP como contrato

## Objetivo

Comprender HTTP como contrato entre cliente y servidor: métodos, rutas, parámetros, códigos de estado y JSON. Analizar una API existente para detectar inconsistencias, y construir una API correctamente desde una especificación propia.

## Estructura de la entrega

```
activities/class-02/
├── README.md
├── request-api-lite/
│   ├── server.js          (API Lite corregida)
│   ├── package.json
│   └── package-lock.json
├── request-api-full-template/
│   ├── docs/
│   │   └── http-contract.md
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── routes/
│   │   │   └── requests.routes.js
│   │   └── data/
│   │       └── requests.js
│   ├── package.json
│   └── package-lock.json
├── lite-analysis.md
└── .gitignore
```

## Cómo ejecutar

### API Lite (corregida)

```bash
cd request-api-lite
npm install
npm start
```

El servidor arranca en `http://localhost:3000`.

### API Full

```bash
cd request-api-full-template
npm install
npm start
```

El servidor arranca en `http://localhost:3000`.

> **Nota:** Solo uno puede correr a la vez en el puerto 3000. Detén el anterior antes de iniciar el otro con `Ctrl + C`.

## Defectos encontrados en el Lite y correcciones

| # | Defecto | Evidencia | Corrección |
|---|---------|-----------|------------|
| 1 | Ruta de listado usa verbo | `GET /getRequests` en lugar de `GET /requests` | Renombrada a `GET /requests` |
| 2 | Recurso inexistente devuelve 200 | `GET /requests/999` → `200` con `{"error":"Request not found"}` | Ahora devuelve `404` |
| 3 | Crear solicitud devuelve 200 | `POST /requests` → `200` | Ahora devuelve `201 Created` |
| 4 | No valida título obligatorio | Acepta crear registros con `title: undefined` | Ahora devuelve `400` si falta el título |

## Decisiones tomadas en el Full

1. **Separación `server.js` / `app.js`**: `server.js` solo inicia el proceso y escucha; `app.js` configura la aplicación (middlewares y rutas). Permite usar la app sin levantar un servidor (útil para pruebas).

2. **`routes/requests.routes.js`**: Las rutas del recurso solicitud están aisladas en su propio archivo. Si mañana se agrega otro recurso, se crea otro archivo de rutas sin tocar este.

3. **`data/requests.js`**: Los datos viven separados del resto. Hoy es un arreglo en memoria; cuando aparezca una base de datos, solo cambia este archivo.

4. **`201` en creación**: Se usa `201 Created` porque se genera un recurso nuevo. `200` solo comunicaría "salió bien" sin indicar que se creó algo.

5. **`400` para validación**: Se valida `title` antes de crear. `400` indica que el problema está en la petición del cliente, no en el servidor.

6. **Sin exclusiones implementadas**: No se agregaron PUT, PATCH, DELETE, base de datos, autenticación ni controladores/servicios/repositorios. Cada una de estas piezas se agregará cuando exista un problema que la justifique.

## Evidencia de ejecución

### GET /requests
```
Request:  GET http://localhost:3000/requests
Response: 200 OK
Body: [{"id":1,"title":"Projector does not turn on",...},{"id":2,...},{"id":3,...}]
```

### GET /requests/1 (existe)
```
Request:  GET http://localhost:3000/requests/1
Response: 200 OK
Body: {"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"}
```

### GET /requests/999 (no existe)
```
Request:  GET http://localhost:3000/requests/999
Response: 404 Not Found
Body: {"error":"Request not found"}
```

### POST /requests (con título)
```
Request:  POST http://localhost:3000/requests
Body: {"title":"Broken door lock","description":"The lock on room 101 does not turn properly.","priority":"high"}
Response: 201 Created
Body: {"id":4,"title":"Broken door lock","description":"The lock on room 101 does not turn properly.","status":"open","priority":"high"}
```

### POST /requests (sin título)
```
Request:  POST http://localhost:3000/requests
Body: {"description":"Missing title","priority":"low"}
Response: 400 Bad Request
Body: {"error":"Title is required"}
```
