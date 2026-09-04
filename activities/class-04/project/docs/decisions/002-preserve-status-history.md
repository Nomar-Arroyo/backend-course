# Preserve the status history of every request

> Decision record · `project/docs/decisions/002-preserve-status-history.md`

## Context

The persistent model in `database/migrations/` needs to answer questions that the current
state alone cannot: when was a request opened? What statuses did it pass through before a
rejection or a resolution? Why did a request go back to `in_progress`?

Storing only the current `status` column (as class 3 did) tells you *where the request is
now* but not *how it got here*. The class-04 requirement explicitly asks to keep track of
"state → antecedents" (the history of each change of state), which means any change of
status must be recorded as an event.

## Options

### Option 1: Keep only the current status

Benefits:

* Minimal schema: no second table; `requests.status` already exists.
* No extra writes on `PATCH`; the update is a single `UPDATE`.

Costs:

* History is lost: after `open → in_progress → resolved`, all that remains is `resolved`.
* No audit trail: cannot know whether a request was cancelled after being opened, or
  whether an answer was ever rejected and re-opened.
* The class-04 requirement of "state → antecedents" is not satisfied, so the model would
  be incomplete.

### Option 2: Add a `request_status_history` table

Benefits:

* Every transition (and every birth) is an auditable event: `previous_status` + `new_status`
  + `changed_at`, per request.
* `GET /requests/:id/history` answers *how did we get here* without changing the resource
  representation.
* The current status remains a denormalized "latest known state" kept in sync by the same
  transaction that writes the event, so reads stay simple.

Costs:

* One more table and one more insert on every status change.
* The insert must be atomic with the update: `requests` and `request_status_history` change
  together or not at all (see `transaction-plan.md`).
* The birth event carries `previous_status = NULL` — a deliberate, documented NULL meaning
  "no previous state existed".

## Decision

We chose **Option 2: a `request_status_history` table that records each birth and each
transition**. `requests.status` keeps the current state for simple reads, and the history
table keeps the sequence of events that produced it. The two writes (request update + event
insert) are always performed inside one transaction (`withTransaction`), so the history can
never drift away from the current status.

## Consequences

What do we gain?

* An audit trail for every change of state, in chronological order.
* A new endpoint `GET /requests/:id/history` that is read-only and cheap.
* The ability to explain *why* a request looks the way it looks (e.g. it was cancelled after
  being opened; it was resolved, rejected and re-opened).

What complexity appears?

* Every status change writes two rows into two tables: more writes per `PATCH`.
* The event insert participates in the transaction: if it fails, the status update rolls
  back (used as the rollback demo in the test matrix).
* The birth event introduces `previous_status = NULL`; any consumer of the data must know
  that NULL means "birth" and not "unknown" (documented in `data-model.md`).

What can no longer be done?

* No silent state change: every transition that happens through the API is recorded.
* There is no corrective/deletive path for history events through the API in this class.

What may need to change later?

* If statuses are ever tracked per technician or per incident, the events could carry actor
  and comment columns (`changed_by`, `note`). The schema leaves room for that.