import express from 'express';
import { requests, generateId } from './requests.store.js';
import { isValidStatus, isValidPriority, canTransition, isTerminal } from './request-status.js';

const router = express.Router();

// This router is mounted at /requests in app.js, so '/' here means GET /requests.

// Uniform error body: { error: { code, message } }. The code is for programs,
// the message is for people.
function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

// GET /requests — List all requests
router.get('/', (req, res) => {
  res.status(200).json(requests);
});

// GET /requests/:id — Get a single request by id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return sendError(res, 404, 'REQUEST_NOT_FOUND', `Request ${id} was not found`);
  }

  res.status(200).json(request);
});

// POST /requests — Create a new request
router.post('/', (req, res) => {
  const { title, description, priority } = req.body ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    return sendError(res, 400, 'MISSING_TITLE', 'Title is required');
  }

  if (priority !== undefined && !isValidPriority(priority)) {
    return sendError(res, 400, 'INVALID_PRIORITY', `"${priority}" is not a valid priority`);
  }

  // The server owns id, status, createdAt and updatedAt: the client cannot set
  // them, and unknown fields are ignored.
  const request = {
    id: generateId(),
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    status: 'open',
    priority: priority === undefined ? 'medium' : priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  requests.push(request);
  res.status(201).json(request);
});

// PATCH /requests/:id — Partial update of a request
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return sendError(res, 404, 'REQUEST_NOT_FOUND', `Request ${id} was not found`);
  }

  const body = req.body ?? {};
  const hasModifiableField = ['title', 'description', 'priority', 'status']
    .some((field) => field in body);

  if (!hasModifiableField) {
    return sendError(res, 400, 'EMPTY_PATCH', 'No modifiable fields were provided');
  }

  if ('status' in body && !isValidStatus(body.status)) {
    return sendError(res, 400, 'INVALID_STATUS', `"${body.status}" is not a valid status`);
  }

  if ('priority' in body && !isValidPriority(body.priority)) {
    return sendError(res, 400, 'INVALID_PRIORITY', `"${body.priority}" is not a valid priority`);
  }

  // A terminal status protects every field, not only status: a closed or
  // cancelled request cannot be touched anymore.
  if (isTerminal(request.status)) {
    return sendError(res, 409, 'REQUEST_IN_TERMINAL_STATUS', `Request ${id} is in a terminal status`);
  }

  if ('status' in body && body.status !== request.status && !canTransition(request.status, body.status)) {
    return sendError(res, 409, 'INVALID_STATUS_TRANSITION', `Cannot move a request from ${request.status} to ${body.status}`);
  }

  if ('title' in body) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return sendError(res, 400, 'MISSING_TITLE', 'Title is required');
    }
    request.title = body.title.trim();
  }

  if ('description' in body) {
    request.description = typeof body.description === 'string' ? body.description : '';
  }

  if ('priority' in body) {
    request.priority = body.priority;
  }

  if ('status' in body) {
    request.status = body.status;
  }

  request.updatedAt = new Date().toISOString();

  res.status(200).json(request);
});

export default router;