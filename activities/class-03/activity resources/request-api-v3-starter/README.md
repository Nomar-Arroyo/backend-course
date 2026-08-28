# Request API — punto de partida de la Clase 3

Este proyecto es la Request API **tal como debió quedar al cerrar la entrega 02**: los tres
endpoints funcionando, con los datos en memoria y la estructura `routes/` + `data/`.

Si tu propio proyecto de la entrega 02 está sano, **continúa sobre el tuyo**. Este starter es
la red de seguridad para no arrastrar problemas de la entrega anterior.

> Nota: los estados de la semilla usan el conjunto de la clase 3
> (`open`, `in_progress`, `resolved`, `closed`, `cancelled`). Si en tu proyecto escribiste
> `in-progress` u otro formato, normalízalo como parte de la migración y documenta el cambio:
> es tu primer contacto con la evolución de un contrato.

## Requisitos

* Node.js 18 o superior (`node --version`).
* Conexión a internet la primera vez, para instalar Express.

## Instalación y ejecución

```bash
cd request-api-v3-starter
npm install
node src/server.js
```

Comprueba el punto de partida:

```bash
curl -i http://localhost:3000/requests
# HTTP/1.1 200 OK — un arreglo con 3 solicitudes
```

## Estructura actual

```txt
request-api-v3-starter/
├── README.md
├── package.json
├── docs/
│   └── http-contract.md
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── requests.routes.js
    └── data/
        └── requests.js
```

## Tu trabajo en la Clase 3 (Entrega 03)

El diseño va **antes** que el código: completa primero los archivos de
`activities/class-03/` (modelo, contrato, mapa de transiciones, matriz de pruebas) y marca el
commit `class-03-design`. Después, sobre este proyecto:

1. **Migra la estructura** a un módulo cohesivo, sin cambiar el comportamiento todavía:

   ```txt
   src/
   ├── app.js
   ├── server.js
   └── modules/
       └── requests/
           ├── requests.routes.js
           ├── requests.store.js
           └── request-status.js
   ```

2. **Reparte responsabilidades**: las rutas solo hablan HTTP; el store administra el array y
   los IDs; `request-status.js` declara estados y transiciones.
3. **Implementa las capacidades nuevas** declaradas en tu contrato:
   * creación con prioridad `medium` por defecto, estado inicial `open` y fechas
     (`createdAt`, `updatedAt`) generadas por el servidor;
   * filtros `?status=` y `?priority=` con validación de valores;
   * `PATCH /requests/:id` con campos modificables (`title`, `description`, `priority`,
     `status`) y campos del servidor ignorados;
   * transiciones controladas por la máquina de estados; `409` para transiciones inválidas y
     para solicitudes en estado terminal;
   * errores consistentes con la forma `{ "error": { "code": "...", "message": "..." } }`.
4. **Registra la decisión** `docs/decisions/001-cancel-instead-of-delete.md`.
5. **Ejecuta tu matriz de pruebas** con `curl` y registra los resultados observados.

## Qué queda explícitamente fuera

* Sin base de datos ni archivos: los datos viven en memoria y se pierden al reiniciar.
  Ese comportamiento es **esperado** en esta entrega.
* Sin `DELETE`: la decisión 001 explica por qué se cancela en lugar de borrar.
* Sin librerías de validación, sin autenticación, sin capas `controllers/services/repositories`.
* Sin dependencias además de Express.

Si una herramienta de IA propone cualquiera de estas cosas, rechazarla y registrarlo en
`ai-usage.md` es parte del ejercicio.
