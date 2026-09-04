# Cancel requests instead of deleting them

> Decision record · `project/docs/decisions/001-cancel-instead-of-delete.md`

## Context

The requirements for the request lifecycle need a way to end a request that will not be
worked on: a report may be a duplicate, may no longer matter, or may be rejected. The
obvious move is to delete it from the collection, but deletion has consequences for
history and reference integrity that the requirement does not ask for. We need a way to
stop a request's lifecycle without destroying its record.

## Options

### Option 1: Physically delete the request

Benefits:

* Keeps the collection small; only relevant records survive.
* The endpoint is simple: remove the object from the array.

Costs:

* Lost history: nobody can audit what was reported, even if it was never attended.
* Broken references: a client that already has `id` 5 will get a `404` with no way to
  know whether the request ever existed or what happened to it.
* Ids start looking like holes; "no results" and "never existed" become impossible to
  tell apart.

### Option 2: Preserve it with status `cancelled`

Benefits:

* History is kept: the request exists, shows who reported it, and a terminal status that
  explains the outcome.
* References stay valid: `GET /requests/5` returns the record instead of a misleading
  `404`.
* Auditable: `cancelled` tells a different story from `closed` — the work was interrupted,
  not completed — without losing the data.

Costs:

* The collection keeps records that are no longer active; filters become the way to
  exclude them.
* One more terminal state to protect in the state machine.
* `cancelled` requests still occupy memory (acceptable in-memory for this course).

## Decision

We chose **Option 2: preserve the request with status `cancelled`**. The API has no
`DELETE` endpoint, and the state machine defines `cancelled` as a terminal state reachable
from `open` and `in_progress`. This is a documented decision, not a universal rule: some
systems legitimately delete data; here the value of history and references is higher than
the cost of keeping inactive records.

## Consequences

What do we gain?

* Every request is traceable from creation to its terminal status.
* Cancel and close are distinct: closing confirms completed work, cancelling records an
  interruption.
* A future deletion feature, if ever needed, can be added and documented separately.

What complexity appears?

* `cancelled` must be guarded: it is terminal, and any `PATCH` against it returns
  `409 REQUEST_IN_TERMINAL_STATUS`.
* The collection grows with inactive records; filters by `status` become the tool to see
  active work.

What can no longer be done?

* There is no way to permanently remove a request through the API.

What may need to change later?

* When a real database arrives, "delete" becomes a persistence-layer decision (soft vs
  hard delete) instead of an in-memory one, and this note is the starting point to
  revisit it.