// HTTP layer of the requests module. It receives HTTP information, picks the
// operation, and returns HTTP responses. Contract/domain decisions live in
// requests.service.js; SQL lives in requests.store.js; lifecycle rules live
// in request-status.js. Raw pg errors are never forwarded: they are logged
// and translated to a safe 503/500 without leaking secrets.

import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';
import { isDatabaseUnavailable } from '../../database/db-errors.js';

const router = express.Router();

// Every error in the API uses the same shape: a machine-readable code and a
// human-readable message.
function errorBody(code, message) {
  return { error: { code, message } };
}

// Translates typed errors (AppError) and unexpected errors (raw pg, etc.)
// into HTTP responses. Never forwards raw database errors or secrets.
function translateError(res, error) {
  if (error && error.category === 'contract') {
    return res.status(400).json(errorBody(error.code, error.message));
  }
  if (error && error.category === 'resource') {
    return res.status(404).json(errorBody(error.code, error.message));
  }
  if (error && error.category === 'domain') {
    return res.status(409).json(errorBody(error.code, error.message));
  }

  // The database itself is unreachable: 503, with a safe, generic message.
  if (isDatabaseUnavailable(error)) {
    console.error('[requests] database unavailable:', error.code ?? error.message);
    return res.status(503).json(errorBody(
      'DATABASE_UNAVAILABLE',
      'The database is currently unavailable. Please try again later.'
    ));
  }

  // Anything else is an internal error for the operator to inspect in the log.
  console.error('[requests] unexpected error:', error);
  return res.status(500).json(errorBody(
    'INTERNAL_ERROR',
    'An unexpected error occurred.'
  ));
}

// Wraps an async handler so a rejected promise flows through translateError.
function asyncRoute(handler) {
  return (req, res) => {
    handler(req, res).catch((error) => translateError(res, error));
  };
}

// GET /requests — list the collection, with optional ?status= and ?priority=.
// An empty result is a valid answer: 200 with []. An unknown filter value is
// a client mistake: 400 (INVALID_STATUS / INVALID_PRIORITY, as in class 03).
router.get('/', asyncRoute(async (req, res) => {
  const { status, priority } = req.query;
  const requests = await listRequests({ status, priority });
  res.status(200).json(requests);
}));

// GET /requests/:id/history — the status history of one request. A request
// that exists always has at least its birth event; a missing request is 404.
router.get('/:id/history', asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const history = await getHistory(id);
  res.status(200).json(history);
}));

// GET /requests/:id — a specific resource either exists or is a 404.
router.get('/:id', asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const request = await getRequest(id);
  res.status(200).json(request);
}));

// POST /requests — the server owns identity, dates, the initial status and
// the default priority. Unknown fields in the body are ignored. The request
// and its birth history are written in one transaction.
router.post('/', asyncRoute(async (req, res) => {
  const { title, description, priority } = req.body ?? {};
  const request = await createRequest({ title, description, priority });
  res.status(201).json(request);
}));

// PATCH /requests/:id — partial update of client-editable fields, protected
// by shape validation (400) and by the domain rules (409). A status change
// records its history event in the same transaction.
router.patch('/:id', asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const request = await patchRequest(id, req.body ?? {});
  res.status(200).json(request);
}));

export default router;