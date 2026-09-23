// OPS-703 · Central error middleware.
//
// ONE place where an error becomes an HTTP response. Express 5 forwards
// thrown errors and rejected promises here on its own, so routes no longer
// wrap their bodies in try/catch — they simply let errors travel.
// Registered AFTER every route, because an error middleware only sees what
// happened BEFORE it and must be the last line of defense.
//
// What the client sees is a contract; what stays in the log is evidence:
// internal message, name and stack are written through the logger and
// NEVER serialized into the response.
import { AppError } from '../app-error.js';
import { logger } from '../logging/logger.js';

const CATEGORY_STATUS = {
  contract: 400,
  auth: 401,
  forbidden: 403,
  resource: 404,
  domain: 409
};

// Errors whose cause is the database being unreachable -> 503.
const INFRASTRUCTURE_CODES = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', '57P03'];

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    // Too late to change the status: let the default handler finish the
    // response and keep the process alive.
    return next(error);
  }

  let status;
  let code;
  let message;

  if (error instanceof AppError) {
    status = CATEGORY_STATUS[error.category] ?? 500;
    code = error.code;
    message = error.message;
  } else if (error?.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'The request body is not valid JSON.';
  } else if (INFRASTRUCTURE_CODES.includes(error?.code) || /Connection terminated/i.test(error?.message ?? '')) {
    status = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'The service cannot access its data store.';
    logger.error('database_unavailable', {
      requestId: req.requestId,
      errorCode: code,
      cause: error.code ?? 'connection'
    });
  } else {
    status = 500;
    code = 'INTERNAL_ERROR';
    message = 'An unexpected error occurred.';
    // The full detail belongs to the developer reading the log — never to
    // the response body. No SQL, no table names, no stack frames leak.
    logger.error('internal_error', {
      requestId: req.requestId,
      errorCode: code,
      name: error?.name ?? 'Error',
      message: error?.message ?? 'No details',
      stack: error?.stack
    });
  }

  // So the request logger can record which error the request ended in.
  res.locals.errorCode = code;
  res.status(status).json({ error: { code, message }, requestId: req.requestId });
}