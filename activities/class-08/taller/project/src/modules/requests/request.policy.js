// Authorization policy for the requests module. Pure functions over an
// actor and (when relevant) a request representation: no SQL, no HTTP.
// The middleware establishes WHO the actor is; these functions decide
// WHAT the actor may do; the service keeps the use-case rules.
//
// Workshop access matrix (fixed baseline — the validator relies on it):
//   list all requests ......... agent
//   list own requests ......... requester (scoped in SQL, not in JS)
//   view / history ............ agent: any · requester: own only
//   create .................... requester
//   edit title/description .... requester, own request, while open
//   change priority ........... agent
//   change status ............. agent (state machine still applies)
//   claim ..................... agent, request open and unassigned (FEATURE-801)

export function canListAllRequests(actor) {
  return actor.role === 'agent';
}

export function canViewRequest(actor, request) {
  if (actor.role === 'agent') return true;
  return request.createdBy === actor.userId;
}

export function canViewHistory(actor, request) {
  return canViewRequest(actor, request);
}

export function canCreateRequest(actor) {
  return actor.role === 'requester';
}

export function canEditContent(actor, request) {
  return actor.role === 'requester'
    && request.createdBy === actor.userId
    && request.status === 'open';
}

export function canChangePriority(actor) {
  return actor.role === 'agent';
}

export function canChangeStatus(actor) {
  return actor.role === 'agent';
}

// Claim policy (FEATURE-801). Pure function over a plain { actor, request }:
// no SQL, no JWT, no Express, no HTTP errors — the reason it is testable
// without a server or a database. Claim has THREE distinct denial reasons
// and each maps to a different HTTP answer (403/409/409). The policy names
// the reason; the SERVICE translates it to an AppError.
export function canClaimRequest({ actor, request }) {
  // Only an agent may claim — the role rule wins over the state rules:
  // even an assigned or non-open request reports NOT_AGENT first, so the
  // caller answers 403 before any state conflict is ever considered.
  if (actor.role !== 'agent') {
    return { allowed: false, reason: 'NOT_AGENT' };
  }
  // An assigned request is already taken: claiming it again is a
  // conflict with its current state.
  if (request.assignedTo !== null && request.assignedTo !== undefined) {
    return { allowed: false, reason: 'ALREADY_ASSIGNED' };
  }
  // The claim is the open -> in_progress move; every other state (even
  // non-terminal ones like in_progress or resolved) is not claimable.
  if (request.status !== 'open') {
    return { allowed: false, reason: 'NOT_OPEN' };
  }
  return { allowed: true };
}
