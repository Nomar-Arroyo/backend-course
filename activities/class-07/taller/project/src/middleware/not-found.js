// OPS-703 · Not-found middleware.
//
// Registered AFTER every route: only a request that no router matched
// reaches this point. It forwards a typed error so the central error
// handler produces the same JSON contract as every other failure.
// The requested path is NOT echoed in the message — attackers use those
// echoes to build scripts, and legitimate callers already know it.
import { AppError } from '../app-error.js';

export function notFound(req, res, next) {
  next(new AppError('resource', 'ROUTE_NOT_FOUND', 'The requested route does not exist.'));
}