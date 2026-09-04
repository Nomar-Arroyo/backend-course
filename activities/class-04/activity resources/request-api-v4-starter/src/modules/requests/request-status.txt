// Domain rules for the request lifecycle: which statuses exist, which are
// terminal, and which transitions are allowed. This is the only place in the
// system that knows the state machine.

export const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

export const TERMINAL_STATUSES = ['closed', 'cancelled'];

// Missing pairs are forbidden: what has no arrow here cannot happen.
const ALLOWED_TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['in_progress', 'closed'],
  closed: [],
  cancelled: []
};

export function isValidStatus(status) {
  return STATUSES.includes(status);
}

export function isTerminal(status) {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransition(from, to) {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}
