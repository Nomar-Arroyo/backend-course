// ============================================================================
// STARTER NOTE — Station 7 (design it in station 1, implement it here).
//
// Authorization policy: pure functions over an actor and (when relevant) a
// request representation. No SQL, no HTTP. The middleware says WHO; these
// functions say WHAT is allowed; the service keeps the use-case rules.
//
// The workshop access matrix is FIXED (the validator relies on it):
//   list all requests ......... agent
//   list own requests ......... requester (scope it in SQL, station 6)
//   view / history ............ agent: any · requester: own only
//   create .................... requester (agents do not create)
//   edit title/description .... requester, own request, while open
//   change priority ........... agent
//   change status ............. agent (the state machine still applies)
//
// Legacy requests (createdBy === null) belong to nobody: only agents see
// them. A requester can never match a null owner.
// ============================================================================

export function canListAllRequests(actor) {
  return actor.role === 'agent';
}

export function canViewRequest(actor, request) {
  if (actor.role === 'agent') return true;
  return request.created_by === actor.userId;
}

export function canViewHistory(actor, request) {
  return canViewRequest(actor, request);
}

export function canCreateRequest(actor) {
  return actor.role === 'requester';
}

export function canEditContent(actor, request) {
  return actor.role === 'requester'
    && request.created_by === actor.userId
    && request.status === 'open';
}

export function canChangePriority(actor) {
  return actor.role === 'agent';
}

export function canChangeStatus(actor) {
  return actor.role === 'agent';
}
