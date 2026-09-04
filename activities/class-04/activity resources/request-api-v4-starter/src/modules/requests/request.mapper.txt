// TODO: the single bridge between SQL rows (snake_case) and the HTTP
// representation (camelCase). A row is not automatically the response.
//
// Contracts:
//   mapRequestRow(row)  -> { id, title, description, priority, status,
//                            createdAt, updatedAt }
//   mapHistoryRow(row)  -> { previousStatus, newStatus, changedAt }

export function mapRequestRow(row) {
  // TODO: translate created_at -> createdAt and updated_at -> updatedAt,
  // keeping every other field the contract promises.
  throw new Error("mapRequestRow is not implemented yet.");
}

export function mapHistoryRow(row) {
  // TODO: translate previous_status, new_status and changed_at.
  throw new Error("mapHistoryRow is not implemented yet.");
}
