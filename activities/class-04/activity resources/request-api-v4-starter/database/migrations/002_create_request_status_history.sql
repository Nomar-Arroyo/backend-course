-- 002 · Status history table — GUIDED: complete the TODOs before running.
-- Your transition-map.md and data-model.md already contain every answer.
-- Run after 001 (the foreign key needs requests to exist).

CREATE TABLE request_status_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- TODO 1: the reference to the request this event belongs to.
  -- Type BIGINT, NOT NULL. The FOREIGN KEY constraint below depends on it.
  request_id BIGINT NOT NULL,

  -- TODO 2: previous_status must ACCEPT NULL. Why? Write the domain reason
  -- as a comment here before moving on (hint: what precedes birth?).
  previous_status VARCHAR(30),

  new_status VARCHAR(30) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT request_status_history_request_fk
    FOREIGN KEY (request_id)
    REFERENCES requests(id),

  -- TODO 3: add request_status_history_previous_check — previous_status is
  -- NULL OR belongs to the five known statuses.

  -- TODO 4: add request_status_history_new_check — new_status belongs to
  -- the five known statuses (NULL is NOT allowed here — why?).

  CONSTRAINT request_status_history_placeholder_check CHECK (new_status <> '')
);

-- When your TODOs are done, remove the placeholder constraint above.
