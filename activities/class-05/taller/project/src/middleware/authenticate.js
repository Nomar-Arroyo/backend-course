// ============================================================================
// STARTER NOTE — Station 5.
//
// Authentication middleware: establishes WHO the actor is, nothing more.
// What the actor may DO is authorization and lives in the module policies.
//
// Contract:
//   * read the Authorization header; require exactly the Bearer scheme
//     ("Basic ...", a bare token or an empty Bearer are not identities)
//     -> AppError('auth', 'AUTHENTICATION_REQUIRED', ...);
//   * verify the token with verifyToken (never just decode it);
//     any verification failure (altered, expired, wrong issuer/audience)
//     -> AppError('auth', 'INVALID_TOKEN', ...) — one same answer, the
//     response never explains which check failed;
//   * on success, build the ONLY trusted source of identity:
//       req.auth = { userId: payload.sub, role: payload.role }
//     and call next().
//
// Errors are answered here with respondError (middlewares do not reach the
// router's try/catch).
// ============================================================================
import { AppError } from '../app-error.js';
import { respondError } from '../http/respond-error.js';
import { verifyToken } from '../modules/auth/token.js';

const BEARER_PATTERN = /^Bearer\s+(.+)$/i;

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const match = typeof header === 'string' ? header.match(BEARER_PATTERN) : null;

  if (!match) {
    return respondError(res, new AppError(
      'auth',
      'AUTHENTICATION_REQUIRED',
      'A Bearer token is required to access this resource.'
    ));
  }

  const token = match[1].trim();
  if (!token) {
    return respondError(res, new AppError(
      'auth',
      'AUTHENTICATION_REQUIRED',
      'A Bearer token is required to access this resource.'
    ));
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    // One same answer for every verification failure: the response never
    // explains which check (signature, expiry, issuer, audience) failed.
    return respondError(res, new AppError(
      'auth',
      'INVALID_TOKEN',
      'The supplied token is not valid.'
    ));
  }

  // The ONLY trusted source of identity for the rest of the pipeline.
  req.auth = { userId: payload.sub, role: payload.role };
  next();
}
