// Dónde vive el token y por qué (decisión documentada también en app/README.md):
//
//   sessionStorage: dura lo que dura la pestaña y desaparece al cerrarla.
//   Es una mejora honrada sobre la memoria del starter (sobrevive al refresh)
//   con un costo real: sessionStorage es legible desde JS, así que un script
//   inyectado (XSS) podría robar el token. Mitigaciones de esta app:
//   - nada del servidor se pinta con innerHTML: solo textContent / createElement
//   - el cliente nunca decide autorización (lo hace el backend con el JWT)
//   - no se guardan secretos del servidor en el cliente (el JWT es solo identidad)
const TOKEN_KEY = 'request_api:access_token';
const USER_KEY = 'request_api:current_user';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}