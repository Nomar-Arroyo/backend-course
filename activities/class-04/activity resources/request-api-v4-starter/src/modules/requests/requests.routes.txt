// STARTER NOTE — these are the CLASS-03 routes, still synchronous and
// still talking to the in-memory store. Your migration TODOs:
//
//   1. Make every handler async and await the operations.
//   2. Move contract/domain decisions into requests.service.js and leave
//      here only: extract path/query/body -> invoke -> translate to HTTP.
//   3. Add GET /:id/history  (200 events | 404 REQUEST_NOT_FOUND).
//   4. Translate typed errors: contract->400, resource->404, domain->409,
//      infrastructure->503 DATABASE_UNAVAILABLE, unknown->500 INTERNAL_ERROR
//      — never forwarding raw pg errors or secrets to the client.
//
// The external contract of the four existing endpoints MUST NOT change.

// HTTP layer of the requests module. It receives HTTP information, picks the
// operation, and returns HTTP responses. Data lives in requests.store.js and
// lifecycle rules live in request-status.js.

import express from 'express';
import {
  listRequests,
  findRequestById,
  addRequest,
  updateRequest
} from './requests.store.js';
import {
  STATUSES,
  isValidStatus,
  isTerminal,
  canTransition
} from './request-status.js';

const router = express.Router();

const PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'priority', 'status'];

// Every error in the API uses the same shape: a machine-readable code and a
// human-readable message.
function errorBody(code, message) {
  return { error: { code, message } };
}

// GET /requests — list the collection, with optional ?status= and ?priority=.
// An empty result is a valid answer: 200 with []. An unknown filter value is
// a client mistake: 400.
router.get('/', (req, res) => {
  const { status, priority } = req.query;

  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json(errorBody(
      'INVALID_FILTER',
      `Unknown status "${status}". Valid values: ${STATUSES.join(', ')}.`
    ));
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return res.status(400).json(errorBody(
      'INVALID_FILTER',
      `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`
    ));
  }

  res.status(200).json(listRequests({ status, priority }));
});

// GET /requests/:id — a specific resource either exists or is a 404.
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = findRequestById(id);

  if (!request) {
    return res.status(404).json(errorBody(
      'REQUEST_NOT_FOUND',
      `Request ${req.params.id} does not exist.`
    ));
  }

  res.status(200).json(request);
});

// POST /requests — the server owns identity, dates, the initial status and
// the default priority. Unknown fields in the body are ignored.
router.post('/', (req, res) => {
  const { title, description, priority } = req.body ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json(errorBody(
      'TITLE_REQUIRED',
      'A request needs a non-empty title.'
    ));
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return res.status(400).json(errorBody(
      'INVALID_PRIORITY',
      `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`
    ));
  }

  const request = addRequest({
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    priority: priority ?? 'medium'
  });

  res.status(201).json(request);
});

// PATCH /requests/:id — partial update of client-editable fields, protected
// by shape validation (400) and by the domain rules (409).
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = findRequestById(id);

  if (!request) {
    return res.status(404).json(errorBody(
      'REQUEST_NOT_FOUND',
      `Request ${req.params.id} does not exist.`
    ));
  }

  const body = req.body ?? {};
  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) changes[field] = body[field];
  }

  // Server-controlled fields (id, createdAt, updatedAt) were never collected,
  // so sending them is the same as not sending anything.
  if (Object.keys(changes).length === 0) {
    return res.status(400).json(errorBody(
      'NO_UPDATABLE_FIELDS',
      `The body must include at least one of: ${UPDATABLE_FIELDS.join(', ')}.`
    ));
  }

  // Shape validation: the request must make sense on its own.
  if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
    return res.status(400).json(errorBody('TITLE_REQUIRED', 'The title cannot be empty.'));
  }

  if (changes.priority !== undefined && !PRIORITIES.includes(changes.priority)) {
    return res.status(400).json(errorBody(
      'INVALID_PRIORITY',
      `Unknown priority "${changes.priority}". Valid values: ${PRIORITIES.join(', ')}.`
    ));
  }

  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    return res.status(400).json(errorBody(
      'INVALID_STATUS',
      `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`
    ));
  }

  // Business rules: the same request can be valid today and invalid tomorrow,
  // depending on the current state of the resource.
  if (isTerminal(request.status)) {
    return res.status(409).json(errorBody(
      'REQUEST_IN_TERMINAL_STATUS',
      `Request ${request.id} is ${request.status} and can no longer be modified.`
    ));
  }

  if (changes.status !== undefined && changes.status !== request.status &&
      !canTransition(request.status, changes.status)) {
    return res.status(409).json(errorBody(
      'INVALID_STATUS_TRANSITION',
      `A request cannot move from ${request.status} to ${changes.status}.`
    ));
  }

  if (changes.title !== undefined) changes.title = changes.title.trim();

  res.status(200).json(updateRequest(request, changes));
});

export default router;
