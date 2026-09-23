// OPS-703 · Request ID middleware.
//
// Every request carries ONE identifier from the moment it enters until its
// final log line. It labels the REQUEST, never the user — a JWT changes per
// user/session and would not tell us which call failed. A client-sent
// X-Request-Id is accepted only when it is boring: alphanumerics plus
// . _ -, at most 64 characters. Anything else is replaced, because an
// unlimited header echoed into logs is a free injection into our own
// observability.
import { randomUUID } from 'node:crypto';

// Explicit lenient pattern: alphanumeric plus . _ - and a bounded length.
const CLIENT_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export function requestId(req, res, next) {
  const clientId = req.headers['x-request-id'];
  const id = (typeof clientId === 'string' && CLIENT_ID_PATTERN.test(clientId))
    ? clientId
    : `req_${randomUUID()}`;

  req.requestId = id;
  res.set('X-Request-Id', id);
  next();
}