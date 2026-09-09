// ============================================================================
// STARTER NOTE — Stations 2, 3 and 4 live here.
//
// Contracts to honor (see docs/http-contract.md and your auth-contract.md):
//
//   register(body) -> { id, email, role: 'requester', createdAt }
//     * allowlist: only email and password may arrive. Any server-controlled
//       field present in the body (role, id, createdAt, updatedAt, createdBy,
//       passwordHash) -> AppError('contract', 'SERVER_CONTROLLED_FIELD', ...).
//       Reject explicitly — never ignore silently.
//     * email: required, basic format, normalize (trim + lowercase) BEFORE
//       storing -> AppError('contract', 'INVALID_EMAIL', ...) otherwise.
//     * password: string of 15..128 characters (Unicode and spaces allowed,
//       no arbitrary composition rules) -> AppError('contract',
//       'INVALID_PASSWORD', ...) otherwise. NEVER log it.
//     * duplicate email -> AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
//       'The account cannot be created with the supplied information.')
//       — generic on purpose: do not confirm that the email exists.
//       (pg raises error.code '23505' on a unique violation.)
//     * store ONLY the hash produced by hashPassword — never the password.
//
//   login(body) -> { accessToken, tokenType: 'Bearer', expiresIn: <seconds> }
//     * EVERY failure (unknown email, wrong password, anything else) answers
//       the SAME AppError('auth', 'INVALID_CREDENTIALS',
//       'Email or password is incorrect.') — identical bytes, no clues.
//     * verify with verifyPassword against the stored hash.
//
//   getCurrentUser(actor) -> { id, email, role }
//     * actor comes from req.auth (station 5). Never return password
//       material of any kind.
// ============================================================================
import { AppError } from '../../app-error.js';
import {
  hashPassword,
  verifyPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from './password.js';
import { issueToken, TOKEN_TTL_SECONDS } from './token.js';
import { findByEmail, findById, insertUser } from '../users/users.store.js';
import { mapUserRow } from '../users/user.mapper.js';

const SERVER_CONTROLLED_FIELDS = [
  'role', 'id', 'createdAt', 'updatedAt', 'createdBy', 'passwordHash'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_CREDENTIALS_ERROR = () => new AppError(
  'auth',
  'INVALID_CREDENTIALS',
  'Email or password is incorrect.'
);

export async function register(body) {
  const payload = body ?? {};

  const forbidden = SERVER_CONTROLLED_FIELDS.find((field) => field in payload);
  if (forbidden) {
    throw new AppError(
      'contract',
      'SERVER_CONTROLLED_FIELD',
      `The field "${forbidden}" is controlled by the server.`
    );
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError('contract', 'INVALID_EMAIL', 'A valid email is required.');
  }

  const password = typeof payload.password === 'string' ? payload.password : '';
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError(
      'contract',
      'INVALID_PASSWORD',
      `The password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`
    );
  }

  const passwordHash = await hashPassword(password);
  let row;
  try {
    row = await insertUser({ email, passwordHash });
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError(
        'domain',
        'ACCOUNT_CANNOT_BE_CREATED',
        'The account cannot be created with the supplied information.'
      );
    }
    throw error;
  }
  return mapUserRow(row);
}

export async function login(body) {
  const payload = body ?? {};
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  const row = await findByEmail(email);
  if (!row) throw GENERIC_CREDENTIALS_ERROR();

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) throw GENERIC_CREDENTIALS_ERROR();

  const accessToken = await issueToken(row);
  return { accessToken, tokenType: 'Bearer', expiresIn: TOKEN_TTL_SECONDS };
}

export async function getCurrentUser(actor) {
  const row = await findById(actor.userId);
  if (!row) {
    // A valid-looking token with no account behind it is not an identity.
    throw new AppError('auth', 'INVALID_TOKEN', 'The authenticated identity is not available.');
  }
  return { id: row.id, email: row.email, role: row.role };
}
