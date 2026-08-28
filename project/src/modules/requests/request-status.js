// Domain rules for the request lifecycle. This module knows nothing about
// Express or about the array: it only declares states and answers whether a
// movement is valid. If the transitions change tomorrow, this is the only file
// to touch.

// Closed set of status values (the contract of the class).
export const REQUEST_STATUSES = [
  'open',
  'in_progress',
  'resolved',
  'closed',
  'cancelled'
];

// Valid priority values.
export const REQUEST_PRIORITIES = ['low', 'medium', 'high'];

// Allowed transitions, indexed by current status. A status with no outgoing
// arrows is terminal: in a transition map, the gaps are also rules.
const ALLOWED_TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['closed', 'in_progress'],
  closed: [], // terminal
  cancelled: [] // terminal
};

// Returns true when the value belongs to the closed set of statuses.
export function isValidStatus(status) {
  return REQUEST_STATUSES.includes(status);
}

// Returns true when the value belongs to the closed set of priorities.
export function isValidPriority(priority) {
  return REQUEST_PRIORITIES.includes(priority);
}

// Answers whether moving from one status to another is allowed by the machine.
export function canTransition(currentStatus, newStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed.includes(newStatus);
}

// A terminal status does not admit any transition out of it.
export function isTerminal(status) {
  return status === 'closed' || status === 'cancelled';
}