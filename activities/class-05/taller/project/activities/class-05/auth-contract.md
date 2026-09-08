# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

Toda respuesta de error tiene la forma:
`{ "error": { "code": "<CODE>", "details": "<mensaje>" } }`

## POST /auth/register

- **Público:** Sí.
- **Body permitido (allowlist):** `email`, `password`.
- Éxito: `201` con
  `{ id, email, role: "requester", createdAt }` — sin hash ni secretos.- **Errores:**
  - `400 INVALID_EMAIL` — email ausente o mal formado.
  - `400 INVALID_PASSWORD` — contraseña fuera de 15..128 caracteres.
  - `400 SERVER_CONTROLLED_FIELD` — el body trae `role`/`id`/`createdAt`/`updatedAt`/`createdBy`/`passwordHash`.
  - `409 ACCOUNT_CANNOT_BE_CREATED` — email ya registrado (genérico, no filtra cuál). Unescrito como 23505 en BD.

## POST /auth/login

- **Público:** Sí.
- **Body permitido:** `email`, `password`.
- Éxito: `200` con
  `{ accessToken, tokenType: "Bearer", expiresIn }` donde `accessToken` es
  un JWT y `expiresIn` son los segundos de vida del token (3600).
- **Errores:**
  - `401 INVALID_CREDENTIALS` — el mismo error idéntico para email inexistente
    y para contraseña incorrecta (no se filtra qué falló).
  - `400` para body malformado si aplica.

## GET /auth/me

- **Protegido:** necesita `Authorization: Bearer <token>`.
- Éxito: `200` con `{ id, email, role, createdAt }` del token autenticado.
- **Errores:**
  - `401 AUTHENTICATION_REQUIRED` — falta o mal formato el header Bearer.
  - `401 INVALID_TOKEN` — token inválido, alterado, vencido o con firma rota.

## Semántica de errores

- `401` = autenticación: no enviaste credenciales válidas (sin Bearer, bearer
  malformado, token inválido/vencido/alterado) o credenciales de login
  incorrectas (`INVALID_CREDENTIALS`).
- `403` = autorización: estás autenticado pero tu rol/propiedad no lo permite
  (`FORBIDDEN`). Un requester que intenta leer/acceder a una solicitud ajena.
- `404` = recurso: la solicitud no existe **o** no existe para ti; se responde
  `404` idéntico al de requisito inexistente para no filtrar la existencia de
  recursos ajenos (a un requester se le responde `404`, no `403`).
- `409` = conflicto de dominio: transición de estado inválida
  (`INVALID_TRANSITION`), email duplicado (`ACCOUNT_CANNOT_BE_CREATED`).
- `400` = contrato violado: `SERVER_CONTROLLED_FIELD`, `INVALID_EMAIL`,
  `INVALID_PASSWORD`, campos ausentes (`MISSING_*`), status/párametro
  inválido.
- `503` = infraestructura (`DATABASE_UNAVAILABLE`); `500` = error no clasificado (`INTERNAL_ERROR`).
