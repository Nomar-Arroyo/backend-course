# AI usage

Este archivo solo puede tener contenido DESPUÉS del checkpoint
`class-05-access-design` (matriz + contrato + amenazas completos).

## My design before AI

Antes de usar IA completé yo la estación 1: `access-matrix.md` (roles, campos
controlados, heredadas), `auth-contract.md` (endpoints y semántica de errores)
y `threat-cases.md` (12 casos adversariales). Validé el checkpoint:
`npm run validate:class-05 -- --stage access-design` → 3/3. A partir de ahí la
IA estaba permitida.

## What I asked

1. Terminar el backend de las estaciones 4-8 sobre el starter: login con JWT,
   middleware de autenticación, propiedad (`createdBy`/`changedBy`) y
   permisos por rol, respetando el contrato fijo de `validate-class-05.js`.
2. Elegir dónde ejecutar las migraciones (Supabase) y diagnosticar la conexión.
3. Documentar la evidencia de validación y las decisiones.

## What the AI proposed

- `token.js`: `issueToken` con `jose` (`HS256`, claims `sub/role/iat/exp/iss/aud`)
  y `verifyToken` con `jwtVerify` (firma+algoritmo+issuer+audience+expiry).
- `login()` con un único `AppError('auth','INVALID_CREDENTIALS')` para todo fallo.
- Middleware `authenticate`: esquema Bearer estricto, `req.auth = { userId, role }`.
- Requests: scope de colección en SQL por `created_by`, recursos ajenos → 404
  idéntico, autorización todo-o-nada en `PATCH` vía `request.policy.js`.
- Conexión a Supabase por el transaction pooler (6543) cuando el session pooler
  (5432) fallaba con `ECONNRESET`.

## What I accepted

Todo lo anterior, después de leerlo y correrlo: cada stage del validador pasó.

## What I rejected

- Diseñar una criptografía propia en lugar del helper `password.js` del starter.
- Exponer `createdBy` desde el body en `POST /requests` (se tomó del token).
- Devolver `403` para recursos ajenos (se eligió `404` para no filtrar existencia).
- Ignorar en silencio campos controlados por el servidor (se rechazan con 400).

## Security mistakes I detected

- El session pooler de Supabase tiraba `ECONNRESET`: no era SSL ni credenciales
  (el transaction pooler conectaba), así que se cambió de punto de conexión.
- Verificar (no decodificar) el JWT: un payload editado con `role: agent` debe
  responder `401 INVALID_TOKEN` (comprobado por el validador).
- `/auth/me` no debe devolver ni hash ni `createdAt` extra: respuesta mínima
  `{ id, email, role }`.

## How I verified the implementation

- `npm run validate:class-05` por stage: setup 5/5, access-design 3/3, register 2/2,
  password 1/1, login 2/2, authentication 2/2, ownership 2/2, authorization 2/2.
- Boss battle integral: **12/12 → CLASS 05 COMPLETED** (evidencia en
  `validation-evidence.md`).

## What I still do not understand

(Respondé con tus palabras, por ejemplo: qué implicaría revocación de tokens
y refresh, o cómo escalaría la autorización a más de dos roles.)