// TODO: unit-of-work helper. Contract:
//
//   withTransaction(work) -> Promise<result of work(client)>
//
//   1. Borrow ONE client from the pool (pool.connect()).
//   2. BEGIN.
//   3. Run `await work(client)` — every query inside the unit must use
//      this client. pool.query() would grab a different connection and
//      silently escape the transaction.
//   4. COMMIT and return the result.
//   5. On any error: ROLLBACK, then re-throw (reverting is not hiding).
//   6. finally: client.release() — always, success or failure.
//
// Reference: the transaction block from the class slides and
// https://node-postgres.com/features/transactions

import { pool } from "./pool.js";

export async function withTransaction(work) {
  // TODO: implement following the contract above.
  throw new Error("withTransaction is not implemented yet.");
}
