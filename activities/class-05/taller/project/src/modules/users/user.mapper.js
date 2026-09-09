// ============================================================================
// STARTER NOTE — Station 2.
//
// The single bridge between user rows and their HTTP representation.
// Contract: mapUserRow(row) -> { id, email, role, createdAt }
//
// The row also carries password_hash. The whole point of this mapper is
// that the hash does NOT survive the crossing: no route can leak what the
// mapper never exposes.
// ============================================================================
export function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at
  };
}
