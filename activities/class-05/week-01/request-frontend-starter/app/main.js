// Entrega 05A — skeleton. Trae el patrón de integración; los flujos son tuyos.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// DECISIÓN DOCUMENTADA: el token vive en memoria. Se pierde al recargar la
// página — limitación honesta de esta estrategia. Si eliges sessionStorage u
// otra alternativa accesible desde JS, documenta el riesgo de XSS en el README.
// Nunca hardcodees un token.
let accessToken = null;
let currentUser = null;

// Un solo cliente para toda la app: agrega el token cuando existe y separa
// "respuesta con error del contrato" de "no hay backend".
async function api(method, path, body) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    // Red caída o CORS: no hay respuesta HTTP que interpretar.
    return { status: 0, body: null };
  }
  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* no-json */ }
  return { status: response.status, body: parsed };
}

// --- elementos ---
const loginForm = document.getElementById('login-form');
const authFeedback = document.getElementById('auth-feedback');
const authPanel = document.getElementById('auth-panel');
const requestsPanel = document.getElementById('requests-panel');
const requestsState = document.getElementById('requests-state');
const requestsList = document.getElementById('requests-list');
const sessionUser = document.getElementById('session-user');
const logoutBtn = document.getElementById('logout-btn');

function setFeedback(element, message, kind) {
  element.textContent = message;
  element.className = `feedback${kind ? ` is-${kind}` : ''}`;
}

// TODO (05A): cada código merece su propio mensaje. Este mapa es el comienzo.
function describeError(status, body) {
  if (status === 0) return 'No se pudo contactar al backend. ¿Está encendido? ¿CORS?';
  if (status === 401) return body?.error?.code === 'INVALID_CREDENTIALS'
    ? 'Email o password incorrectos.'
    : 'Tu sesión no es válida o expiró. Vuelve a entrar.';
  if (status === 403) return 'Tu rol no permite esta operación.';
  if (status === 404) return 'Esa solicitud no existe (o no es tuya).';
  if (status === 409) return body?.error?.message ?? 'Conflicto con el estado actual.';
  if (status >= 500) return 'El servidor tuvo un problema. Intenta de nuevo.';
  return body?.error?.message ?? 'La petición no cumplió el contrato.';
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  setFeedback(authFeedback, 'Entrando…');

  const login = await api('POST', '/auth/login', {
    email: data.get('email'),
    password: data.get('password')
  });
  if (login.status !== 200) {
    setFeedback(authFeedback, describeError(login.status, login.body), 'error');
    return;
  }
  accessToken = login.body.accessToken;

  const me = await api('GET', '/auth/me');
  if (me.status !== 200) {
    setFeedback(authFeedback, describeError(me.status, me.body), 'error');
    accessToken = null;
    return;
  }
  currentUser = me.body;
  sessionUser.textContent = `${currentUser.email} · ${currentUser.role}`;
  logoutBtn.hidden = false;
  authPanel.hidden = true;
  requestsPanel.hidden = false;
  setFeedback(authFeedback, '');
  loadRequests();
});

logoutBtn.addEventListener('click', () => {
  // Logout LOCAL: olvida el token aquí. OJO: el JWT sigue siendo válido hasta
  // su expiración — este backend educativo no tiene revocación.
  accessToken = null;
  currentUser = null;
  sessionUser.textContent = 'Sin sesión';
  logoutBtn.hidden = true;
  requestsPanel.hidden = true;
  authPanel.hidden = false;
});

async function loadRequests() {
  setFeedback(requestsState, 'Cargando…');
  requestsList.replaceChildren();

  const result = await api('GET', '/requests');
  if (result.status !== 200) {
    setFeedback(requestsState, describeError(result.status, result.body), 'error');
    return;
  }
  if (result.body.length === 0) {
    setFeedback(requestsState, 'Todavía no hay solicitudes. Crea la primera.');
    return;
  }
  setFeedback(requestsState, `${result.body.length} solicitud(es).`, 'ok');
  for (const request of result.body) {
    const item = document.createElement('li');
    const title = document.createElement('span');
    title.textContent = `#${request.id} · ${request.title}`;
    const status = document.createElement('span');
    status.className = 'request-status';
    status.textContent = `${request.status} · ${request.priority}`;
    item.append(title, status);
    requestsList.append(item);
  }
  // TODO (05A): detalle, historial, creación, filtros, edición condicionada
  // y las acciones de agent con sus transiciones disponibles.
}
