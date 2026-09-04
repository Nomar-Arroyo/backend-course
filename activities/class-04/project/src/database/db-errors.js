// Classifies a raw error from pg/PostgreSQL as "database unavailable" so the
// routes can answer 503 DATABASE_UNAVAILABLE without leaking the real error.
//
// A connection-level failure (SQLSTATE starting with 08, or a Node network
// error) means the database itself cannot answer. Anything else (a violated
// CHECK, a syntax mistake) is NOT "unavailable" and must be handled as a
// regular internal error.

const SQLSTATE_CONNECTION = /^08/;
const NODE_CONNECTION_ERRORS = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENETDOWN",
  "EADDRNOTAVAIL",
  "EAI_AGAIN"
];

export function isDatabaseUnavailable(error) {
  if (!error || typeof error !== "object") return false;

  // Codes from node-postgres / Node's net module.
  if (typeof error.code === "string") {
    if (SQLSTATE_CONNECTION.test(error.code)) return true;
    if (NODE_CONNECTION_ERRORS.includes(error.code)) return true;
  }

  // Some pg connection failures arrive without a SQLSTATE code.
  const message = typeof error.message === "string" ? error.message : "";
  if (/connection|socket|ECONNREFUSED|timeout|terminat/i.test(message)) {
    return true;
  }

  return false;
}