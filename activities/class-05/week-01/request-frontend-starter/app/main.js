// Entrega 05A — controlador. Consume la API real de la clase 05
// (autenticación + propiedad + permisos). Nada de mocks.
import { api } from './src/api.js';
import {
  getToken, setToken, clearSession,
  getCurrentUser, setCurrentUser
} from './src/session.js';
import {
  describeStatus,
  STATUS_LABELS, PRIORITIES, TRANSITIONS, TERMINAL_STATUSES
} from './src/state.js';
import { el, setAlert, statusBadge, priorityBadge, fmtDateTime, shortId } from './src/ui.js';

const $ = (id) => document.getElementById(id);

const authView = $('auth-view');
const appView = $('app-view');
const sessionUser = $('session-user');
const roleBadge = $('role-badge');
const logoutBtn = $('logout-btn');
const authFeedback = $('auth-feedback');

const tabLogin = $('tab-login');
const tabRegister = $('tab-register');
const loginForm = $('login-form');
const registerForm = $('register-form');

const filterStatus = $('filter-status');
const filterPriority = $('filter-priority');
const applyFilters = $('apply-filters');
const reloadBtn = $('reload-btn');
const newRequestBtn = $('new-request-btn');
const toolbarFeedback = $('toolbar-feedback');
const createPanel = $('create-form');
const createForm = $('create-form-fields');
const createFeedback = $('create-feedback');
const createCancel = $('create-cancel');
const listTitle = $('list-title');
const listCount = $('list-count');
const listState = $('list-state');
const listEl = $('request-list');
const detailPanel = $('detail-panel');
const detailTitle = $('detail-title');
const detailFields = $('detail-fields');
const detailDescription = $('detail-description');
const detailActions = $('detail-actions');
const detailFeedback = $('detail-feedback');
const historyList = $('history-list');
const detailBack = $('detail-back');

let currentUser = null;
let requests = [];
let activeRequest = null;
let activeHistory = [];

// ---------------------------------------------------------------------------
// Navegación de vistas y sesión
// ---------------------------------------------------------------------------
function showAuth(state = null) {
  currentUser = null;
  appView.hidden = true;
  authView.hidden = false;
  logoutBtn.hidden = true;
  roleBadge.hidden = true;
  sessionUser.textContent = 'Sin sesión';
  setAlert(authFeedback, state);
}

function showWorkspace() {
  authView.hidden = true;
  appView.hidden = false;
  setAlert(authFeedback, null);
  setAlert(detailFeedback, null);
  setAlert(toolbarFeedback, null);
  detailPanel.hidden = true;

  sessionUser.textContent = currentUser.email;
  roleBadge.hidden = false;
  roleBadge.className = 'badge badge-role';
  roleBadge.textContent = currentUser.role;
  logoutBtn.hidden = false;

  // El requester puede crear; el agent no (y ve todas las solicitudes).
  newRequestBtn.hidden = currentUser.role !== 'requester';
  listTitle.textContent = currentUser.role === 'agent'
    ? 'Todas las solicitudes'
    : 'Mis solicitudes';

  filterStatus.value = '';
  filterPriority.value = '';
  loadList();
}

// Una respuesta 401 fuera del login significa sesión inválida/vencida.
function handleAuthFailure() {
  const state = describeStatus(401, { error: { code: 'INVALID_TOKEN' } });
  clearSession();
  showAuth(state);
}

function renderUserBar() {
  if (!currentUser) {
    sessionUser.textContent = 'Sin sesión';
    roleBadge.hidden = true;
    logoutBtn.hidden = true;
    return;
  }
  sessionUser.textContent = currentUser.email;
  roleBadge.hidden = false;
  roleBadge.textContent = currentUser.role;
  logoutBtn.hidden = false;
}

// ---------------------------------------------------------------------------
// Autenticación: tabs, login, registro
// ---------------------------------------------------------------------------
function switchTab(name) {
  const toLogin = name === 'login';
  tabLogin.classList.toggle('is-active', toLogin);
  tabRegister.classList.toggle('is-active', !toLogin);
  loginForm.hidden = !toLogin;
  registerForm.hidden = toLogin;
  setAlert(authFeedback, null);
}

tabLogin.addEventListener('click', () => switchTab('login'));
tabRegister.addEventListener('click', () => switchTab('register'));

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setAlert(authFeedback, { kind: 'loading', title: 'Entrando…', message: 'Consultando credenciales.' });
  const data = new FormData(loginForm);
  const login = await api('POST', '/auth/login', {
    email: data.get('email'),
    password: data.get('password')
  });

  if (login.status !== 200) {
    setAlert(authFeedback, describeStatus(login.status, login.body));
    return;
  }

  setToken(login.body.accessToken);
  const me = await api('GET', '/auth/me');
  if (me.status !== 200) {
    clearSession();
    setAlert(authFeedback, describeStatus(me.status, me.body));
    return;
  }

  currentUser = me.body;
  setCurrentUser(currentUser);
  renderUserBar();
  showWorkspace();
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setAlert(authFeedback, { kind: 'loading', title: 'Creando cuenta…', message: 'Registrando requester.' });
  const data = new FormData(registerForm);
  const email = String(data.get('email')).trim();
  const password = String(data.get('password'));

  const result = await api('POST', '/auth/register', { email, password });
  if (result.status !== 201) {
    setAlert(authFeedback, describeStatus(result.status, result.body));
    return;
  }

  loginForm.elements.email.value = email;
  loginForm.elements.password.value = '';
  switchTab('login');
  setAlert(authFeedback, {
    kind: 'success',
    title: 'Cuenta creada',
    message: `Ya podés iniciar sesión como ${result.body.email}.`
  });
});

logoutBtn.addEventListener('click', () => {
  // Logout LOCAL: el JWT sigue válido hasta expirar (no hay revocación).
  clearSession();
  showAuth();
});

// ---------------------------------------------------------------------------
// Lista y filtros
// ---------------------------------------------------------------------------
async function loadList({ silent = false } = {}) {
  if (!silent) {
    listEl.replaceChildren();
    setAlert(listState, { kind: 'loading', title: 'Cargando…', message: 'Buscando solicitudes.' });
  }

  const params = new URLSearchParams();
  if (filterStatus.value) params.set('status', filterStatus.value);
  if (filterPriority.value) params.set('priority', filterPriority.value);
  const qs = params.toString();

  const result = await api('GET', `/requests${qs ? `?${qs}` : ''}`);
  if (result.status === 401) return handleAuthFailure();
  if (result.status !== 200) {
    setAlert(listState, describeStatus(result.status, result.body));
    return;
  }

  requests = result.body;
  renderList();
}

function renderList() {
  listEl.replaceChildren();
  if (requests.length === 0) {
    setAlert(listState, {
      kind: 'empty',
      title: 'Nada por acá',
      message: currentUser.role === 'requester'
        ? 'Todavía no creaste ninguna solicitud. Tocá "Nueva solicitud".'
        : 'No hay solicitudes con esos filtros.'
    });
    listCount.textContent = '';
    return;
  }

  setAlert(listState, { kind: 'success', title: 'Lista cargada', message: `${requests.length} solicitud(es).` });
  listCount.textContent = `${requests.length}`;

  for (const request of requests) {
    const createdBy = request.createdBy ? `creada por ${shortId(request.createdBy)}` : 'heredada (sin dueño)';
    const meta = el('div', { class: 'list-meta' },
      el('span', { text: `#${request.id}` }),
      stateChip(request),
      el('span', { text: createdBy }),
      el('span', { text: `actualizada ${fmtDateTime(request.updatedAt)}` })
    );
    const title = el('div', { class: 'list-title' }, request.title);
    const top = el('div', { class: 'list-top' }, title, el('span', { class: 'row' },
      statusBadge(request.status), priorityBadge(request.priority)));

    const card = el('button', { class: 'list-card', type: 'button',
      on: { click: () => openDetail(request.id) } }, top, meta);
    listEl.append(el('li', {}, card));
  }
}

function stateChip(request) {
  return el('span', { text: `${STATUS_LABELS[request.status] ?? request.status} · ${request.priority}` });
}

applyFilters.addEventListener('click', () => loadList());
reloadBtn.addEventListener('click', () => loadList());

// ---------------------------------------------------------------------------
// Crear solicitud (solo requester en la UI; el backend decide igualmente)
// ---------------------------------------------------------------------------
function openCreate() {
  createForm.reset();
  createPanel.hidden = false;
  setAlert(createFeedback, null);
  createForm.elements.title.focus();
}

function closeCreate() {
  createPanel.hidden = true;
  setAlert(createFeedback, null);
}

newRequestBtn.addEventListener('click', openCreate);
createCancel.addEventListener('click', closeCreate);

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setAlert(createFeedback, { kind: 'loading', title: 'Creando…', message: 'Guardando la solicitud.' });
  const data = new FormData(createForm);
  const body = {
    title: String(data.get('title')).trim(),
    priority: data.get('priority')
  };
  const description = String(data.get('description') ?? '').trim();
  if (description) body.description = description;

  const result = await api('POST', '/requests', body);
  if (result.status === 401) return handleAuthFailure();
  if (result.status !== 201) {
    setAlert(createFeedback, describeStatus(result.status, result.body));
    return;
  }

  closeCreate();
  await loadList({ silent: true });
  setAlert(listState, {
    kind: 'success',
    title: 'Solicitud creada',
    message: `#${result.body.id} ya figura en tu lista.`
  });
});

// ---------------------------------------------------------------------------
// Detalle e historial
// ---------------------------------------------------------------------------
async function loadDetail(id) {
  detailPanel.hidden = false;
  detailTitle.textContent = `Solicitud #${id}`;
  setAlert(detailFeedback, { kind: 'loading', title: 'Cargando…', message: 'Leyendo detalle e historial.' });
  detailActions.replaceChildren();
  historyList.replaceChildren();

  const [reqRes, histRes] = await Promise.all([
    api('GET', `/requests/${id}`),
    api('GET', `/requests/${id}/history`)
  ]);
  if (reqRes.status === 401 || histRes.status === 401) return handleAuthFailure();
  if (reqRes.status !== 200) {
    setAlert(detailFeedback, describeStatus(reqRes.status, reqRes.body));
    return;
  }
  if (histRes.status !== 200) {
    setAlert(detailFeedback, describeStatus(histRes.status, histRes.body));
    return;
  }

  activeRequest = reqRes.body;
  activeHistory = histRes.body;
  renderDetail();
  return true;
}

function openDetail(id) {
  createPanel.hidden = true;
  loadDetail(id);
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

detailBack.addEventListener('click', () => {
  detailPanel.hidden = true;
  setAlert(detailFeedback, null);
  loadList({ silent: true });
});

function renderDetail() {
  const request = activeRequest;
  const own = request.createdBy === currentUser.id;

  const fields = [
    ['Estado', statusBadge(request.status)],
    ['Prioridad', priorityBadge(request.priority)],
    ['Creada por', request.createdBy ? shortId(request.createdBy) : 'sistema (heredada)'],
    ['¿Tuya?', own ? 'Sí' : 'No'],
    ['Creada', fmtDateTime(request.createdAt)],
    ['Actualizada', fmtDateTime(request.updatedAt)]
  ];
  detailFields.replaceChildren();
  for (const [name, value] of fields) {
    detailFields.append(
      el('div', {},
        el('dt', { text: name }),
        el('dd', {}, value instanceof Node ? value : String(value)))
    );
  }

  detailDescription.textContent = request.description ?? 'Sin descripción.';
  renderDetailActions(request);
  renderHistory();
}

function renderDetailActions(request) {
  detailActions.replaceChildren();
  const own = request.createdBy === currentUser.id;
  const terminal = TERMINAL_STATUSES.includes(request.status);

  if (currentUser.role === 'requester') {
    if (!own) return; // no debería ocurrir: un ajeno responde 404
    if (terminal) {
      detailActions.append(el('p', { class: 'hint', text: `El estado "${request.status}" es terminal: ya no podés editar esta solicitud.` }));
      return;
    }
    detailActions.append(buildEditContent(request));
    return;
  }

  // agent
  if (terminal) {
    detailActions.append(el('p', { class: 'hint', text: `El estado "${request.status}" es terminal: no hay acciones disponibles.` }));
    return;
  }
  detailActions.append(buildPriorityEdit(request));
  detailActions.append(buildStatusControls(request));
}

function buildEditContent(request) {
  const titleInput = el('input', { name: 'title', type: 'text', required: true, maxlength: 200, value: request.title });
  const descInput = el('textarea', { name: 'description', rows: 4, text: request.description ?? '' });
  const feedback = el('p', { class: 'alert', role: 'status' });
  setAlert(feedback, null);

  const form = el('form', { class: 'stack' },
    el('h3', { text: 'Editar título y descripción' }),
    el('label', {}, 'Título *', titleInput),
    el('label', {}, 'Descripción', descInput),
    el('div', { class: 'row' },
      el('button', { type: 'submit', text: 'Guardar' }),
      el('button', { type: 'button', class: 'ghost', text: 'Cancelar',
        on: { click: () => renderDetailActions(request) } }))
    ,
    feedback);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setAlert(feedback, { kind: 'loading', title: 'Guardando…', message: 'Aplicando cambios.' });
    const body = { title: titleInput.value.trim() };
    if (String(descInput.value).trim()) body.description = descInput.value.trim();

    const result = await api('PATCH', `/requests/${request.id}`, body);
    if (result.status === 401) return handleAuthFailure();
    if (result.status !== 200) {
      setAlert(feedback, describeStatus(result.status, result.body));
      return;
    }
    await loadDetail(request.id);
    loadList({ silent: true });
    setAlert(detailFeedback, {
      kind: 'success', title: 'Cambios guardados', message: 'Título y descripción actualizados.'
    });
  });

  return el('div', { class: 'action-block' }, form);
}

function buildPriorityEdit(request) {
  const select = el('select', { name: 'priority' });
  for (const priority of PRIORITIES) {
    const option = el('option', { value: priority, text: priority });
    if (priority === request.priority) option.selected = true;
    select.append(option);
  }
  const feedback = el('p', { class: 'alert', role: 'status' });
  setAlert(feedback, null);

  const apply = el('button', { type: 'button', text: 'Aplicar prioridad' });
  apply.addEventListener('click', async () => {
    setAlert(feedback, { kind: 'loading', title: 'Guardando…', message: 'Cambiando prioridad.' });
    const result = await api('PATCH', `/requests/${request.id}`, { priority: select.value });
    if (result.status === 401) return handleAuthFailure();
    if (result.status !== 200) {
      setAlert(feedback, describeStatus(result.status, result.body));
      return;
    }
    await loadDetail(request.id);
    loadList({ silent: true });
    setAlert(detailFeedback, {
      kind: 'success', title: 'Prioridad actualizada', message: `Ahora es ${result.body.priority}.`
    });
  });

  return el('div', { class: 'action-block' },
    el('h3', { text: 'Cambiar prioridad' }),
    el('div', { class: 'row' },
      el('label', {}, 'Prioridad', select),
      apply),
    feedback);
}

function buildStatusControls(request) {
  const available = TRANSITIONS[request.status] ?? [];
  const feedback = el('p', { class: 'alert', role: 'status' });
  setAlert(feedback, null);

  const buttons = available.map((to) =>
    el('button', { type: 'button', text: `→ ${STATUS_LABELS[to] ?? to}`,
      on: { click: () => changeStatus(request.id, to, feedback) } }));

  return el('div', { class: 'action-block' },
    el('h3', { text: 'Cambiar estado (solo transiciones válidas)' }),
    el('div', { class: 'row' }, buttons),
    feedback);
}

async function changeStatus(id, to, feedback) {
  setAlert(feedback, { kind: 'loading', title: 'Guardando…', message: `Moviendo a ${to}.` });
  const result = await api('PATCH', `/requests/${id}`, { status: to });
  if (result.status === 401) return handleAuthFailure();
  if (result.status !== 200) {
    // 409 (transición inválida / estado terminal) y 403 se ven con mensajes
    // propios y distintos, NUNCA con un "algo salió mal" genérico.
    setAlert(feedback, describeStatus(result.status, result.body));
    return;
  }
  await loadDetail(id);
  loadList({ silent: true });
  setAlert(detailFeedback, {
    kind: 'success', title: 'Estado actualizado', message: `La solicitud ahora está ${STATUS_LABELS[result.body.status]}.`
  });
}

function renderHistory() {
  historyList.replaceChildren();
  if (activeHistory.length === 0) {
    historyList.append(el('li', { class: 'history-item muted', text: 'Sin historial de cambios.' }));
    return;
  }
  for (const entry of activeHistory) {
    const actor = entry.changedBy ? `por ${shortId(entry.changedBy)}` : 'por el sistema (heredado)';
    historyList.append(el('li', { class: 'history-item' },
      el('span', {},
        el('b', { text: entry.previousStatus ?? '—' }),
        el('span', { text: '→' }),
        el('b', { text: entry.newStatus })),
      el('span', { class: 'muted', text: `${fmtDateTime(entry.changedAt)} · ${actor}` })
    ));
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function boot() {
  const savedUser = getCurrentUser();
  if (savedUser && getToken()) {
    currentUser = savedUser;
    renderUserBar();
    showWorkspace();
  } else {
    showAuth();
  }
}

boot();