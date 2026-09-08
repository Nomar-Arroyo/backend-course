# Request Frontend — starter (entregas 05A y 05B)

Esqueleto mínimo con Vite: dos páginas que crecen dos semanas.

```txt
app/    → entrega 05A: la interfaz que consume tu API real
learn/  → entrega 05B: «El mundo de la autenticación»
```

## Arranque

```bash
npm install
cp .env.example .env      # VITE_API_URL apuntando a tu backend
npm run dev               # http://localhost:5173
```

En el backend, `.env` debe tener `FRONTEND_ORIGIN=http://localhost:5173`
(el origen EXACTO de este frontend) para que CORS acepte las peticiones.

## Qué trae y qué falta

Trae: cliente `api()` con manejo de token **en memoria**, login funcional de
ejemplo y el patrón para distinguir estados de interfaz. Falta: todo lo demás
(registro, flujos de requester y agent, estados completos) — eso ES la entrega.

## La decisión del token (documéntala)

Este starter guarda el token en memoria: se pierde al recargar y esa es una
limitación honesta, no un bug. Si eliges `sessionStorage` u otra alternativa
accesible desde JavaScript, escribe en este README qué riesgo de XSS aceptas y
por qué. `localStorage` no es la respuesta universal: es una opción con costos.

Nunca publiques `dist/` con tokens, cuentas reales ni URLs privadas.
