// OPS-703 · Request logger middleware.
//
// ONE structured JSON line per finished request, whatever its outcome.
// The fields are an explicit ALLOWLIST — never the whole request object,
// which would carry headers like Authorization into the logs. The line is
// written on the 'finish' event, the only moment the final status code is
// known, and next() runs immediately so logging never delays the request.
import { logger } from '../logging/logger.js';

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const fields = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100
    };

    if (req.auth) fields.userId = req.auth.userId;
    if (res.locals.errorCode) fields.errorCode = res.locals.errorCode;

    // >= 500: the request failed from the service point of view; the
    // rest is traffic on the happy path. Different levels, same allowlist.
    if (res.statusCode >= 500) {
      logger.error('request_failed', fields);
    } else {
      logger.info('request_completed', fields);
    }
  });

  next();
}