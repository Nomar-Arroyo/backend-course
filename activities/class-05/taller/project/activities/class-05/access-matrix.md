# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.

| Operación | Anónimo | Requester | Agent |
| --------- | ------: | --------: | ----: |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| Editar título/descripción | No | Propia y abierta | No |
| Cambiar prioridad | No | No | Sí |
| Cambiar estado | No | No | Sí |

## Campos controlados por el servidor

El cliente JAMÁS puede enviar estos campos; si los manda, la API responde
`400` con `error.code = "SERVER_CONTROLLED_FIELD"`.

- En `POST /auth/register`: `role`, `id`, `createdAt`, `updatedAt`,
  `createdBy`, `passwordHash`. El rol siempre lo decide el servidor y es
  `requester`.
- En `PATCH /requests/:id`: `createdBy`, `changedBy`, `id`, `createdAt`,
  `updatedAt` — los actores salen del token autenticado, nunca del body.

## Solicitudes heredadas

Las solicitudes sin propietario (`created_by IS NULL`, creadas antes de la
migración 004) las ve SOLO `agent`. Un requester no puede reclamar la
propiedad de una solicitud que no creó, y al no tener dueño no puede
demostrar acceso legítimo; el agente, al poder ver todas, también cubre las
heredadas.
