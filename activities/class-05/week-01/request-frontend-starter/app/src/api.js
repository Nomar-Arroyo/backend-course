// Un solo cliente HTTP para toda la app (entrega 05A).
// Separa "el servidor respondió" de "no hay backend": toda respuesta se
// normaliza a { status, body }. status 0 = red caída / CORS / backend apagado.
import { getToken } from './session.js';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function api(method, path, body) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    return { status: 0, body: null };
  }

  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* cuerpo sin JSON */ }
  return { status: response.status, body: parsed };
}