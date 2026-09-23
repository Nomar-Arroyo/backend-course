// HTTP layer of the requests module: it extracts path, query, body and
// the authenticated actor, invokes the operation, and translates results
// and typed errors into HTTP responses. It contains no SQL and no domain
// rules. The router assumes app.js mounted it behind `authenticate`, so
// req.auth is always present here.
//
// Express 5 forwards thrown errors and rejected promises to the central
// error middleware (src/middleware/error-handler.js), so handlers have NO
// try/catch — errors simply travel to ONE translation point. Data reaching
// SQL is validated first:
//   INC-701  the raw id is checked as a positive integer (INVALID_REQUEST_ID
//            in the service) BEFORE any query runs — a malformed value is
//            never passed down as parsed integer nor as SQL input;
//   INC-702  the priority is checked against PRIORITIES in the service
//            (INVALID_PRIORITY) before the transaction starts.
import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { status, priority } = req.query;
  res.status(200).json(await listRequests(req.auth, { status, priority }));
});

router.get('/:id', async (req, res) => {
  // Raw parameter on purpose: the service decides what a valid id is, so a
  // malformed value NEVER becomes SQL input (see INVALID_REQUEST_ID).
  res.status(200).json(await getRequest(req.auth, req.params.id));
});

router.get('/:id/history', async (req, res) => {
  res.status(200).json(await getHistory(req.auth, req.params.id));
});

router.post('/', async (req, res) => {
  res.status(201).json(await createRequest(req.auth, req.body));
});

router.patch('/:id', async (req, res) => {
  res.status(200).json(await patchRequest(req.auth, req.params.id, req.body));
});

export default router;