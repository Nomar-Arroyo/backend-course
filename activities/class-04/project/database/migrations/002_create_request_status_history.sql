-- 002 · Status history table — completed per data-model.md.
-- Run after 001 (the foreign key needs requests to exist).

CREATE TABLE request_status_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- The request this event belongs to.
  request_id BIGINT NOT NULL,

  -- previous_status ACCEPTS NULL because NULL means BIRTH: a request is
  -- born directly in 'open' and at that moment there was NO previous
  -- status to record. Inventing a fake previous status would be dishonest.
  previous_status VARCHAR(30),

  -- new_status must NEVER be NULL: every event describes which status was
  -- reached (birth -> open, transition -> target). An event without a
  -- reached status means nothing.
  new_status VARCHAR(30) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT request_status_history_request_fk
    FOREIGN KEY (request_id)
    REFERENCES requests(id),

  -- previous_status is either the birth (NULL) or one of the five statuses.
  CONSTRAINT request_status_history_previous_check
    CHECK (
      previous_status IS NULL OR
      previous_status IN (
        'open',
        'in_progress',
        'resolved',
        'closed',
        'cancelled'
      )
    ),

  -- new_status always belongs to the five statuses (NULL is NOT allowed).
  CONSTRAINT request_status_history_new_check
    CHECK (
      new_status IN (
        'open',
        'in_progress',
        'resolved',
        'closed',
        'cancelled'
      )
    )
);