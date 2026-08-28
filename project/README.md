# Request API v3

API REST (Express + Node.js) que administra **solicitudes de mantenimiento** de un plantel.
Proyecto transversal de la materia Desarrollo Backend — Entrega 03: modelo de recurso,
contrato HTTP, máquina de estados y filtros.

Los datos viven **en memoria**: al reiniciar el servidor se pierden. Es comportamiento
esperado y documentado; la persistencia es un problema de una clase futura.

## Requisitos

* Node.js 18 o superior.
* Instalar dependencias la primera vez (`npm install`). Solo se usa Express.

## Ejecutar

```bash
npm install
npm start
```

El servidor arranca en `http://localhost:3000`.

## Estructura

```txt
project/
├── README.md
├── package.json
├── docs/
│   ├── http-contract.md                     (contrato de la API)
│   └── decisions/
│       └── 001-cancel-instead-of-delete.md  (nota de decisión)
└── src/
    ├── app.js                               (configura la app: middlewares y rutas)
    ├── server.js                            (arranca el proceso, escucha en el puerto)
    └── modules/
        └── requests/                        (todo lo de solicitudes junto)
            ├── requests.routes.js           (HTTP entra y sale; no toca el array ni evalúa transiciones)
            ├── requests.store.js            (administra el array y la identidad; no sabe de códigos de estado)
            └── request-status.js            (declara estados, transiciones y valida movimientos; no conoce Express ni el array)
```

## Capacidades

* Creación con `id`, `status` (`open`), `createdAt`, `updatedAt` y `priority`
  (`medium` por defecto) generados por el servidor; los campos que el cliente no controla
  se ignoran.
* Consulta de colección e individual.
* Filtros por `status` y `priority` combinables; `400` para valores desconocidos;
  `200 []` cuando no hay coincidencias.
* Actualización parcial con `PATCH` (`title`, `description`, `priority`, `status`).
* Transiciones controladas por la máquina de estados (`request-status.js`): `409` para
  transiciones inválidas y para solicitudes en estado terminal.
* Formato de error unificado: `{ "error": { "code": "...", "message": "..." } }`.

## Exclusiones

Sin base de datos ni persistencia en archivo, sin `DELETE`, sin librerías de validación,
sin autenticación, sin capas `controllers/services/repositories`, sin dependencias además
de Express, sin frontend. Estas exclusiones son parte del contrato de la entrega.

## Verificación

La matriz de pruebas con los resultados observados está en
`activities/class-03/test-matrix.md`.