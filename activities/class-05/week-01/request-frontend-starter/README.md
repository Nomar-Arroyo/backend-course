# Request Frontend — entrega 05A (`/app`)

Interfaz real de la API de la clase 05 con Vite. La entrega 05B
(`/learn`, «El mundo de la autenticación») vive como proyecto Vite
independiente en `activities/class-05/week-02/`.

```txt
app/   → entrega 05A: la interfaz que consume tu API real
```

## Arranque

```bash
npm install
cp .env.example .env      # VITE_API_URL apuntando a tu backend
npm run dev               # http://localhost:5173
```

En el backend, `.env` debe tener `FRONTEND_ORIGIN=http://localhost:5173`
(el origen EXACTO de este frontend) para que CORS acepte las peticiones.

## La decisión del token (documéntala)

Este starter guardaba el token en memoria (se perdía al recargar). La decisión
final de la 05A está documentada en `app/README.md`: el token vive en
`sessionStorage`, con su costo de XSS declarado y sus mitigaciones.
`localStorage` no se eligió deliberadamente.

Nunca publiques `dist/` con tokens, cuentas reales ni URLs privadas.