// SQL layer against PostgreSQL. Contracts (see persistence-contract.md):
//
//   findAll(filters, db = pool)                       -> rows[]
//   findById(id, db = pool)                           -> row | null
//   insertRequest({title, description, priority}, db) -> row  (INSERT ... RETURNING)
//   updateRequest(id, changes, db)                    -> row | null (UPDATE ... RETURNING)
//   insertStatusHistory(requestId, prev, next, db)    -> void
//   findHistory(requestId, db)                        -> rows[]
//
// Rules: parameterized queries only ($1, $2...), explicit columns, and the
// optional `db` parameter so the service can pass a transaction client.
// This module returns RAW rows (snake_case); the mapper translates them.

import { pool } from "../../database/pool.js";

const REQUEST_COLUMNS =
  "id, title, description, priority, status, created_at, updated_at";

// Only the service-validated, known fields become SQL columns. Column names
// are fixed here on purpose — they can never come from the client, because
// SQL identifiers cannot be parameterized.
const FILTER_COLUMNS = {
  status: "status",
  priority: "priority"
};

export async function findAll(filters = {}, db = pool) {
  const clauses = [];
  const params = [];

  for (const [key, column] of Object.entries(FILTER_COLUMNS)) {
    const value = filters[key];
    if (value === undefined || value === null) continue;
    params.push(value);
    clauses.push(`${column} = $${params.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `SELECT ${REQUEST_COLUMNS} FROM requests ${where} ORDER BY id ASC`;

  const result = await db.query(sql, params);
  return result.rows;
}

export async function findById(id, db = pool) {
  const result = await db.query(
    `SELECT ${REQUEST_COLUMNS} FROM requests WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertRequest({ title, description, priority }, db) {
  const result = await db.query(
    `INSERT INTO requests (title, description, priority)
     VALUES ($1, $2, $3)
     RETURNING ${REQUEST_COLUMNS}`,
    [title, description, priority]
  );
  return result.rows[0];
}

export async function updateRequest(id, changes, db) {
  // Only known, pre-validated fields reach the SET clause. Column names are
  // fixed below on purpose; the values come from the caller as parameters.
  const sets = [];
  const params = [];

  for (const key of ["title", "description", "priority", "status"]) {
    if (key in changes) {
      params.push(changes[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }

  // A PATCH always renews the modification date, even when the status did
  // not change. SQL identifiers stay fixed; values always parameterized.
  params.push(id);
  sets.push(`updated_at = CURRENT_TIMESTAMP`);

  const result = await db.query(
    `UPDATE requests
     SET ${sets.join(", ")}
     WHERE id = $${params.length}
     RETURNING ${REQUEST_COLUMNS}`,
    params
  );
  return result.rows[0] ?? null;
}

export async function insertStatusHistory(requestId, previousStatus, newStatus, db) {
  await db.query(
    `INSERT INTO request_status_history (request_id, previous_status, new_status)
     VALUES ($1, $2, $3)`,
    [requestId, previousStatus, newStatus]
  );
}

export async function findHistory(requestId, db = pool) {
  const result = await db.query(
    `SELECT previous_status, new_status, changed_at
     FROM request_status_history
     WHERE request_id = $1
     ORDER BY changed_at ASC, id ASC`,
    [requestId]
  );
  return result.rows;
}