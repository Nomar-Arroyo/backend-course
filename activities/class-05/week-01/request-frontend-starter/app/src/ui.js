// Helpers de DOM: nada del servidor se pinta con innerHTML, solo con
// textContent + createElement (mitiga el riesgo de XSS documentado en la
// decisión del token). applyAlert muestra cada estado de interfaz con su
// clase propia (loading / network / db / session / forbidden / ...).
import { STATUS_LABELS, PRIORITY_LABELS } from './state.js';

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === false || value === undefined || value === null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'on') {
      for (const [event, handler] of Object.entries(value)) {
        node.addEventListener(event, handler);
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// Estado de interfaz en un nodo <p class="alert">: { kind, title, message }.
export function setAlert(node, state) {
  if (!state) {
    node.hidden = true;
    node.replaceChildren();
    return;
  }
  node.hidden = false;
  node.className = `alert state-${state.kind}`;
  node.replaceChildren(el('strong', { text: state.title }), el('span', { text: state.message }));
}

export function badge(text, kind) {
  return el('span', { class: `badge badge-${kind}` }, text);
}

export function statusBadge(status) {
  return badge(STATUS_LABELS[status] ?? status, `status-${status}`);
}

export function priorityBadge(priority) {
  return badge(PRIORITY_LABELS[priority] ?? priority, `priority-${priority}`);
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('es');
}

export function shortId(uuid) {
  return uuid ? uuid.slice(0, 8) : null;
}