# Registro de decisiones — Clase 05

Una entrada por decisión no obvia: qué decidiste, qué alternativas había y por
qué.

## D1 — La identidad confiable vive en `req.auth`, no en el body ni en el payload decodificado

El middleware `authenticate` verifica el JWT con `jose` (firma, algoritmo,
issuer, audience y expiración) y construye `req.auth = { userId, role }` como
**única** fuente de identidad. Decisión: `createdBy` y `changedBy` siempre salen
de ahí. Alternativa descartada: confiar en campos del body (permite suplantar
actores) o en el payload sin verificar (decodificar permite leer, no confiar).

## D2 — Un recurso ajeno responde `404`, no `403`

`getRequest`, `getHistory` y el scope de `listRequests` tratan el recurso de
otro usuario como inexistente. Alternativa descartada: responder `403`
(delata que el recurso existe y habilita enumeración). Decisión: mismo código y
mismo mensaje `REQUEST_NOT_FOUND` para "no existe" y para "existe pero no es
tuyo".

## D3 — Las solicitudes heredadas (`created_by IS NULL`) son solo de `agent`

Las filas creadas antes de la migración 004 no tienen dueño. Un requester no
puede demostrar acceso legítimo (nunca puede matchear un `NULL`), así que el
scope en SQL (`created_by = <actor>`) las excluye automáticamente; el agente
ve todas. Decisión tomada en el diseño (estación 1) y mantenida en la
implementación.

## D4 — Autorización todo-o-nada en `PATCH`

Antes de escribir una sola columna se autoriza el lote completo de cambios:
si `title`/`description` piden `canEditContent`, `priority` pide
`canChangePriority` y `status` pide `canChangeStatus`. Un body mixto con un
solo campo prohibido responde `403 FORBIDDEN` y **no** aplica la parte
permitida (no hay actualizaciones parciales inesperadas).

## D5 — Un único error genérico para todo fallo de login

Email inexistente y contraseña incorrecta producen exactamente los mismos bytes
(`401 INVALID_CREDENTIALS`), para impedir enumeración de cuentas por la
respuesta.

## D6 — Campos controlados por el servidor: rechazo explícito, nunca silencio

Si el body trae `role`, `id`, `createdAt`, `updatedAt`, `createdBy`,
`passwordHash` o `changedBy` (y `status` en el POST), se responde
`400 SERVER_CONTROLLED_FIELD`. Alternativa descartada: ignorarlos
silenciosamente (acopla el backend a clientes mentirosos y dificulta la
depuración).

## D7 — Infraestructura: Supabase nuevo proyecto, connection vía transaction pooler

Se creó un nuevo proyecto en Supabase y se aplicaron las migraciones 001→005
en orden. El session pooler (5432) reseteaba la conexión (`ECONNRESET`); se usa
el transaction pooler (6543, `?pgbouncer=true`) que mantiene el mismo contrato
y funciona de forma estable. La contraseña y la URL viven solo en `.env`
(gitignoreado).