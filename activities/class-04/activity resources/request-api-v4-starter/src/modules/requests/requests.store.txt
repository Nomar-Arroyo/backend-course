// STARTER NOTE — this is still the CLASS-03 in-memory store. Your job is
// to replace its internals with SQL against PostgreSQL, keeping these
// contracts (see persistence-contract.md):
//
//   findAll(filters, db = pool)                    -> rows[]
//   findById(id, db = pool)                        -> row | null
//   insertRequest({title, description, priority}, db) -> row   (INSERT ... RETURNING)
//   updateRequest(id, changes, db)                 -> row | null (UPDATE ... RETURNING)
//   insertStatusHistory(requestId, prev, next, db) -> void
//   findHistory(requestId, db)                     -> rows[]
//
// Rules: parameterized queries only ($1, $2...), explicit columns, and the
// optional `db` parameter so the service can pass a transaction client.
// TODO: convert one function at a time and verify each with curl.

// In-memory storage for requests. It owns the array and the identity of each
// request. It knows nothing about HTTP and nothing about which transitions
// are legal — that lives in request-status.js.

const requests = [
  {
    id: 1,
    title: 'Projector does not turn on',
    description: 'The projector in room 204 shows no image during class.',
    status: 'open',
    priority: 'high',
    createdAt: '2026-08-17T14:00:00.000Z',
    updatedAt: '2026-08-17T14:00:00.000Z'
  },
  {
    id: 2,
    title: 'Broken chair in the lab',
    description: 'One chair in the computer lab has a loose back rest.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2026-08-18T09:30:00.000Z',
    updatedAt: '2026-08-19T11:15:00.000Z'
  },
  {
    id: 3,
    title: 'Wi-Fi drops in the library',
    description: 'The connection drops every few minutes on the second floor.',
    status: 'open',
    priority: 'low',
    createdAt: '2026-08-20T16:45:00.000Z',
    updatedAt: '2026-08-20T16:45:00.000Z'
  }
];

// Identity comes from a counter that only moves forward. It never depends on
// requests.length: removing or cancelling items must not recycle ids.
// Known limitation: the counter lives in process memory and restarts with it.
let nextRequestId = 4;

function generateId() {
  const id = nextRequestId;
  nextRequestId += 1;
  return id;
}

export function listRequests(filters = {}) {
  return requests.filter((request) => {
    if (filters.status && request.status !== filters.status) return false;
    if (filters.priority && request.priority !== filters.priority) return false;
    return true;
  });
}

export function findRequestById(id) {
  return requests.find((request) => request.id === id);
}

export function addRequest({ title, description, priority }) {
  const now = new Date().toISOString();
  const request = {
    id: generateId(),
    title,
    description,
    status: 'open',
    priority,
    createdAt: now,
    updatedAt: now
  };
  requests.push(request);
  return request;
}

export function updateRequest(request, changes) {
  Object.assign(request, changes);
  request.updatedAt = new Date().toISOString();
  return request;
}
