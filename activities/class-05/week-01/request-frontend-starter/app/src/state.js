// Catálogo compartido del dominio + traductor de respuestas a estados de
// interfaz. Regla 05A: cada situación (loading, empty, success, 400, 401,
// 403, 404, 409, 500, 503/red) le dice al usuario algo DISTINTO porque ES un
// problema distinto. Un único mensaje genérico no cumple.
import { API_URL } from './api.js';

export const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
export const PRIORITIES = ['low', 'medium', 'high'];

export const STATUS_LABELS = {
  open: 'Abierta',
  in_progress: 'En progreso',
  resolved: 'Resuelta',
  closed: 'Cerrada',
  cancelled: 'Cancelada'
};

export const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta'
};

// Máquina de estados de la clase 03: open → in_progress/cancelled, etc.
export const TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['in_progress', 'closed'],
  closed: [],
  cancelled: []
};

export const TERMINAL_STATUSES = ['closed', 'cancelled'];

const CODE_MESSAGES = {
  INVALID_EMAIL: 'El email no tiene un formato válido.',
  INVALID_PASSWORD: 'La contraseña debe tener entre 15 y 128 caracteres.',
  INVALID_PRIORITY: 'La prioridad no es válida (low, medium o high).',
  INVALID_STATUS: 'El estado elegido no es válido.',
  INVALID_FILTER: 'El filtro elegido no es válido.',
  TITLE_REQUIRED: 'La solicitud necesita un título no vacío.',
  NO_UPDATABLE_FIELDS: 'No se envió ningún campo actualizable.',
  SERVER_CONTROLLED_FIELD: 'Se intentó enviar un campo controlado por el servidor.',
  ACCOUNT_CANNOT_BE_CREATED: 'No se pudo crear la cuenta con esos datos.',
  INVALID_STATUS_TRANSITION: 'Esa transición de estado no está permitida desde el estado actual.',
  REQUEST_IN_TERMINAL_STATUS: 'La solicitud está cerrada o cancelada: ya no se puede modificar.',
  REQUEST_NOT_FOUND: 'La solicitud no existe o no es tuya.',
  FORBIDDEN: 'Tu rol no permite esta operación.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.'
};

// Traduce { status, body } a un estado de interfaz con título y mensaje.
export function describeStatus(status, body = null) {
  const code = body?.error?.code;

  if (status === 0) {
    return {
      kind: 'network',
      title: 'Backend no disponible',
      message: `No se pudo contactar a la API en ${API_URL}. ¿Está encendido el servidor y el CORS acepta este origen?`
    };
  }
  if (status === 503) {
    return {
      kind: 'db',
      title: 'Base de datos no disponible',
      message: 'El servidor respondió, pero su base de datos no está accesible. Probá de nuevo en un momento.'
    };
  }
  if (status === 401) {
    if (code === 'INVALID_CREDENTIALS') {
      return { kind: 'auth', title: 'Credenciales inválidas', message: CODE_MESSAGES.INVALID_CREDENTIALS };
    }
    return {
      kind: 'session',
      title: 'Sesión no válida',
      message: 'Tu token no es válido o expiró. Iniciá sesión de nuevo.'
    };
  }
  if (status === 403) {
    return { kind: 'forbidden', title: 'Operación no permitida', message: CODE_MESSAGES.FORBIDDEN };
  }
  if (status === 404) {
    return { kind: 'notfound', title: 'Solicitud no encontrada', message: CODE_MESSAGES.REQUEST_NOT_FOUND };
  }
  if (status === 409) {
    return {
      kind: 'conflict',
      title: 'Conflicto con el estado actual',
      message: CODE_MESSAGES[code] ?? body?.error?.message ?? 'La operación choca con el estado actual de la solicitud.'
    };
  }
  if (status === 400) {
    return {
      kind: 'validation',
      title: 'La petición no cumple el contrato',
      message: CODE_MESSAGES[code] ?? body?.error?.message ?? 'Revisá los datos enviados.'
    };
  }
  if (status >= 500) {
    return {
      kind: 'server',
      title: 'Error interno del servidor',
      message: 'La API tuvo un problema inesperado. Intentá de nuevo más tarde.'
    };
  }
  return {
    kind: 'error',
    title: 'Respuesta inesperada',
    message: body?.error?.message ?? `La API respondió ${status}.`
  };
}