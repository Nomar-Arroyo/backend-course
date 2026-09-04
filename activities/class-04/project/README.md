# Request API v4

API REST (Express + Node.js) que administra **solicitudes de mantenimiento** de un plantel.
Proyecto de la materia Desarrollo Backend — Entrega 04: migración del almacenamiento en
memoria a **PostgreSQL** (Supabase), con historial de estados, transacciones y errores sin
filtración de secretos.

Los datos viven en **PostgreSQL**: al reiniciar Express la información persiste, y cada
cambio de estado queda registrado como un evento en el historial.

## Requisitos

* Node.js 18 o superior.
* Dependencias (`npm install`). La API se conecta a PostgreSQL vía `pg` y lee la
  configuración desde `.env` con `dotenv`.

## Configuración de la base

Crear el archivo `.env` a partir de `.env.example` y pegar la cadena del **Session pooler**
(panel de Supabase → Connect). El `.env` está en `.gitignore`: **no se sube ni se comparte**.

```bash
npm install          # primera vez
cp .env.example .env # (en Windows: copy .env.example .env) y editar DATABASE_URL
npm run db:check     # verifica conexión y versión, sin imprimir secretos
```

Luego, en el SQL Editor de Supabase, ejecutar en orden:

1. `database/migrations/001_create_requests.sql`
2. `database/migrations/002_create_request_status_history.sql`
3. `database/seed.sql`

## Ejecutar

```bash
npm start
```

El servidor arranca en `http://localhost:3000`.

## Estructura

```txt
project/
├── README.md
├── .env.example                        (plantilla; el .env real está gitignoreado)
├── package.json
├── database/
│   ├── migrations/
│   │   ├── 001_create_requests.sql
│   │   └── 002_create_request_status_history.sql
│   └── seed.sql
├── docs/
│   ├── http-contract.md                (contrato de la API)
│   └── decisions/
│       ├── 001-cancel-instead-of-delete.md
│       └── 002-preserve-status-history.md
├── scripts/
│   └── check-database.js               (verifica conexión, nunca imprime DATABASE_URL)
└── src/
    ├── app.js                          (configura la app: middlewares y rutas)
    ├── server.js                       (arranca el proceso, escucha en el puerto)
    ├── database/
    │   ├── pool.js                     (pool compartido; falla temprano sin DATABASE_URL)
    │   ├── transaction.js              (withTransaction: BEGIN/COMMIT/ROLLBACK/release)
    │   └── db-errors.js                (clasifica errores de conexión para el 503)
    └── modules/
        └── requests/
            ├── requests.routes.js      (HTTP entra y sale; traduce errores tipeados)
            ├── requests.service.js     (reglas de proceso y unidades de trabajo; AppError)
            ├── requests.store.js       (SQL parametrizado; devuelve filas crudas)
            ├── request.mapper.js       (fila snake_case → representación camelCase)
            └── request-status.js       (estados, transiciones y valores cerrados)
```

## Capacidades

* Creación persistente: la solicitud y su **evento de nacimiento** se insertan en una sola
  transacción (rollback si algo falla).
* Consulta de colección, individual e **historial** (`GET /requests/:id/history`).
* Filtros por `status` y `priority` combinables; `400` para valores desconocidos;
  `200 []` cuando no hay coincidencias.
* Actualización parcial con `PATCH`; el cambio de `status` registra su evento de historial
  en la misma transacción (rollback si algo falla).
* Transiciones controladas por la máquina de estados (`request-status.js`): `409` para
  transiciones inválidas y para solicitudes en estado terminal.
* Formato de error unificado: `{ "error": { "code": "...", "message": "..." } }`.
* `503 DATABASE_UNAVAILABLE` cuando la base no responde, sin filtrar secretos.
* Consultas parametrizadas (`$1`, `$2`, ...) y columnas explícitas; el `id` y las fechas
  los genera PostgreSQL (`IDENTITY`, `CURRENT_TIMESTAMP`).

## Exclusiones

Sin ORM, sin librerías de validación, sin `supabase-js` ni Data API (claves anónimas), sin
`DELETE` (decisión 001: cancelar en vez de borrar), sin autenticación, sin paginación, sin
frontend. Dependencias solo `express`, `pg` y `dotenv`.

## Verificación

La matriz de pruebas con los resultados observados está en
`activities/class-04/test-matrix.md`.