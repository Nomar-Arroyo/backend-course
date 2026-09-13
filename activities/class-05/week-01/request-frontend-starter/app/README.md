# Entrega 05A — Interfaz gráfica para la API de solicitudes

Consume la **API real** de la clase 05 (`taller/project/src`) con autenticación,
propiedad y permisos. No hay mocks ni endpoints inventados: el contrato es el
que valida `scripts/validate-class-05.js`.

## Cómo correrla

1. Backend (clase 05) corriendo en `http://localhost:3000`, con su `.env`
   configurado y `FRONTEND_ORIGIN=http://localhost:5173` (CORS; el backend ya
   viene así).
2. `npm install` en la raíz de este proyecto.
3. `cp .env.example .env` (opcional: `VITE_API_URL` ya cae en
   `http://localhost:3000`).
4. `npm run dev` → abrir **http://localhost:5173/app/**.
5. Build de entrega: `npm run build` (IPv4 build OK; `dist/` no se commitea).

## La decisión del token (documentada)

El token de acceso vive en **`sessionStorage`**:

- Dura lo que la pestaña: sobrevive al *refresh*, se borra al cerrar la pestaña.
- Es una mejora sobre la memoria pura del starter, aceptando un costo real:
  `sessionStorage` es **accesible desde JavaScript**, así que un script
  inyectado (XSS) podría leer el token.
- **Mitigaciones de esta app:**
  1. Nada del servidor se pinta con `innerHTML`; todo va por `textContent` y
     `createElement` (`app/src/ui.js`).
  2. El cliente nunca toma decisiones de autorización: el rol y la propiedad
     los decide el backend con el JWT (ocultar botones es UX, no seguridad).
  3. El JWT es identidad, no secreto del servidor: no guardamos claves ni
     credenciales de BD en el navegador.

`localStorage` no se usó deliberadamente: persiste indefinidamente y agranda la
ventana de exposición sin aportarle nada a una demo educativa.

## Cuentas de prueba (sin datos sensibles)

| Cuenta | Rol | Cómo se obtiene |
| ------ | --- | --------------- |
| `demo-requester@example.com` / `ContraseniaClase05Demo!` | requester | Se registra desde `/app` (crear cuenta). |
| `demo-agent@example.com` / `ContraseniaClase05Demo!` | agent | Se registra como requester y luego se promueve por SQL (educativo, no hay endpoint): |

```sql
-- Consola SQL de Supabase: promueve al usuario demo a agente.
UPDATE users SET role = 'agent' WHERE email = 'demo-agent@example.com';
```

> La promoción de rol es docente y controlada (SQL), como define el contrato:
> el registro SIEMPRE crea `requester` y no existe endpoint para escalar rol.

## Matriz de escenarios probados

| Escenario | Rol / situación | Respuesta API | Estado de interfaz |
| --------- | --------------- | ------------- | ------------------ |
| Abrir `/app` sin sesión | Anónimo | — | vista de autenticación |
| Cerrar pestaña y volver | Sesión en `sessionStorage` | — | workspace restaurado |
| Registro con password corta | Anónimo | `400 INVALID_PASSWORD` | `state-validation` (amber) con texto propio |
| Registro con email duplicado | Anónimo | `409 ACCOUNT_CANNOT_BE_CREATED` | `state-conflict` |
| Login con email/password mal | Anónimo | `401 INVALID_CREDENTIALS` | `state-auth` «Credenciales inválidas» |
| Login correcto | requester | `200` login + `200 /auth/me` | workspace de requester |
| Crear solicitud | requester | `201` | lista refrescada, `state-success` |
| Listar solicitudes | requester | `200` (solo suyas) | lista con scoping real |
| Filtro por estado/prioridad | requester | `200` filtrado | lista filtrada |
| Filtro inválido | cualquiera | `400 INVALID_FILTER` | `state-validation` |
| Ver detalle + historial | dueño | `200` + `200 history` | detalle con línea de tiempo |
| Abrir detalle ajeno (URL manual) | requester | `404 REQUEST_NOT_FOUND` | `state-notfound` |
| Editar contenido propia abierta | requester | `200` | detalle recargado, `state-success` |
| Editar contenido propia cerrada | requester | `409 REQUEST_IN_TERMINAL_STATUS` | `state-conflict` |
| Cambiar prioridad/estado | requester | `403 FORBIDDEN` (si intenta) | `state-forbidden` (y sin botones en la UI) |
| Listar todas / cambiar prioridad | agent | `200` / `200` | lista completa + control de prioridad |
| `open → resolved` (salto ilegal) | agent | `409 INVALID_STATUS_TRANSITION` | `state-conflict` con transición inválida |
| `open → in_progress` / `resolved → closed` | agent | `200` | estado actualizado, historial nuevo |
| Acción sobre estado terminal | agent | `409` | nota «terminal» + sin acciones |
| Backend apagado | cualquiera | sin respuesta | `state-network` (púrpura) «Backend no disponible» |
| Backend sin DB | cualquiera | `503 DATABASE_UNAVAILABLE` | `state-db` |

## Reflexión corta sobre la integración

Lo valioso de armar el frontend contra el backend real fue sentir en carne
propia cada decisión de la clase 05. `description` puede ser `null`, `createdBy`
puede ser `null` (heredadas) y el `404` de un recurso ajeno es indistinguible
del de uno inexistente — la UI lo muestra y no se inventa un `403`. La
transición de estados (clase 03) obliga a que el agent elija entre **las
transiciones que el backend acepta** en lugar de ofrecer 5 estados sueltos, y
los `409` son parte del flujo normal de uso, no un fallo raro. El token en
`sessionsStorage` demuestra que "el acceso desde JS" tiene un precio que hay
que documentar y mitigar.

## Uso de IA (ai-usage)

La IA se usó DESPUÉS del checkpoint `class-05-access-design` (el diseño de
acceso del backend ya estaba validado 3/3). Se le pidió:

1. Implementar la entrega 05A en vanilla JS sobre el starter de Vite:
   cliente `api()`, manejo de sesión, vistas auth/requester/agent, y el
   catálogo de estados de interfaz (loading/empty/success/400/401/403/404/
   409/500/503/red).
2. Respetar el contrato real del backend: scoping en SQL para requester,
   `404` ajeno, transiciones válidas de la máquina de estados, y `403` para
   lo que el rol no permite.

Se aceptó todo el código producido tras revisarlo y probarlo con `npm run
build`. Se rechazó: ocultar botones como si fuera autorización (la UI oculta
acciones de agent para UX, pero la seguridad la decide el backend), volver a
`innerHTML` con datos del servidor, y usar `localStorage` para el token sin
documentar su costo.

## Evidencia de integración

- Build exitoso: `npm run build` (páginas: `/` y `/app`; la 05B vive en
  `activities/class-05/week-02`).
- Validación del backend detrás de esta UI: boss battle **12/12** en
  `taller/project/activities/class-05/validation-evidence.md`.
- Captura del flujo: ver la matriz de escenarios probados (arriba) + el repo.