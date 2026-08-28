// In-memory storage. There is no database: the data resets on every restart.
// Seed data covers every status so the test matrix can run with stable ids.
export const requests = [
  {
    id: 1,
    title: 'Projector does not turn on',
    description: 'The projector in room 204 shows no image during class.',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-08-28T14:00:00.000Z',
    updatedAt: '2026-08-28T14:00:00.000Z'
  },
  {
    id: 2,
    title: 'Broken chair in the lab',
    description: 'One chair in the computer lab has a loose back rest.',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2026-08-28T14:05:00.000Z',
    updatedAt: '2026-08-28T14:05:00.000Z'
  },
  {
    id: 3,
    title: 'Wi-Fi drops in the library',
    description: 'The connection drops every few minutes on the second floor.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2026-08-28T14:10:00.000Z',
    updatedAt: '2026-08-28T14:10:00.000Z'
  },
  {
    id: 4,
    title: 'Authorize new lab software',
    description: 'Request approval to install the new design suite.',
    status: 'closed',
    priority: 'low',
    createdAt: '2026-08-28T14:15:00.000Z',
    updatedAt: '2026-08-28T14:15:00.000Z'
  },
  {
    id: 5,
    title: 'Replace lab light bulbs',
    description: 'Several bulbs in the computer lab are burned out.',
    status: 'cancelled',
    priority: 'high',
    createdAt: '2026-08-28T14:20:00.000Z',
    updatedAt: '2026-08-28T14:20:00.000Z'
  }
];

// Identifier for the next request that gets created. It only advances; it never
// depends on the array length, so it does not repeat ids while the process lives.
let nextId = 6;

// Returns a fresh identifier and prepares the following one.
export function generateId() {
  const id = nextId;
  nextId = nextId + 1;
  return id;
}

// Looks up a request by id, returning undefined when it does not exist.
export function findById(id) {
  return requests.find((item) => item.id === id);
}