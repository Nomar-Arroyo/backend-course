// ============================================================================
// Requests service — ownership, scope and authorization.
//
// Every exported operation receives the authenticated actor first. The actor
// is the ONLY source of identity: createdBy / changedBy never come from the
// body. Ownership scope lives in SQL (the store), authorization lives in
// request.policy.js, and the state machine from class 3 keeps binding every
// role (409 stays 409).
// ============================================================================

import { withTransaction } from '../../database/transaction.js';
import {
  findAll,
  findById,
  insertRequest,
  updateRequest,
  insertStatusHistory,
  findHistory
} from './requests.store.js';
import { mapRequestRow, mapHistoryRow } from './request.mapper.js';
import { STATUSES, isValidStatus, isTerminal, canTransition } from './request-status.js';
import { AppError } from '../../app-error.js';
import {
  canListAllRequests,
  canViewRequest,
  canCreateRequest,
  canEditContent,
  canChangePriority,
  canChangeStatus
} from './request.policy.js';

const PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'priority', 'status'];

function serverControlledField(name) {
  return new AppError('contract', 'SERVER_CONTROLLED_FIELD',
    `The field "${name}" is controlled by the server.`);
}

function forbidden() {
  return new AppError('forbidden', 'FORBIDDEN',
    'You are not allowed to perform this operation.');
}

function notFound(id) {
  // The SAME 404 code/message for missing and for foreign requests: a
  // foreign resource must not reveal that it exists.
  return new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
}

// Explicit rejection, never silent ignoring: if any server-controlled field
// arrives, the whole body is refused with 400 SERVER_CONTROLLED_FIELD.
function assertNoServerControlledFields(body, fields) {
  for (const field of fields) {
    if (body?.[field] !== undefined) throw serverControlledField(field);
  }
}

function assertValidPriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY',
      `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }
}

export async function listRequests(actor, filters = {}) {
  if (filters.status !== undefined && !isValidStatus(filters.status)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown status "${filters.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (filters.priority !== undefined && !PRIORITIES.includes(filters.priority)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown priority "${filters.priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  // The ownership scope lives in the SQL WHERE clause: an agent sees the
  // whole collection, a requester only rows created by them (legacy rows
  // with created_by IS NULL never match a requester).
  const scope = canListAllRequests(actor)
    ? { ...filters }
    : { ...filters, createdBy: actor.userId };
  const rows = await findAll(scope);
  return rows.map(mapRequestRow);
}

export async function getRequest(actor, id) {
  const row = await findById(id);
  if (!row || !canViewRequest(actor, row)) throw notFound(id);
  return mapRequestRow(row);
}

export async function createRequest(actor, input) {
  assertNoServerControlledFields(input, [
    'id', 'createdBy', 'createdAt', 'updatedAt', 'changedBy', 'status'
  ]);

  if (!canCreateRequest(actor)) throw forbidden();

  const { title, description, priority } = input ?? {};
  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('contract', 'TITLE_REQUIRED', 'A request needs a non-empty title.');
  }
  if (priority !== undefined) assertValidPriority(priority);

  // Creation is a unit of work: the request AND its birth history
  // (NULL -> open) happen together or not at all. Both record the actor
  // from the token.
  const row = await withTransaction(async (client) => {
    const created = await insertRequest({
      title: title.trim(),
      description: typeof description === 'string' ? description : null,
      priority: priority ?? 'medium',
      createdBy: actor.userId
    }, client);
    await insertStatusHistory(created.id, null, created.status, actor.userId, client);
    return created;
  });

  return mapRequestRow(row);
}

export async function patchRequest(actor, id, body) {
  assertNoServerControlledFields(body, [
    'id', 'createdBy', 'createdAt', 'updatedAt', 'changedBy'
  ]);

  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body?.[field] !== undefined) changes[field] = body[field];
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError('contract', 'NO_UPDATABLE_FIELDS',
      `The body must include at least one of: ${UPDATABLE_FIELDS.join(', ')}.`);
  }
  if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
    throw new AppError('contract', 'TITLE_REQUIRED', 'The title cannot be empty.');
  }
  if (changes.priority !== undefined) assertValidPriority(changes.priority);
  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    throw new AppError('contract', 'INVALID_STATUS',
      `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (changes.title !== undefined) changes.title = changes.title.trim();

  // Read, authorize the WHOLE change, validate against the current state,
  // write and record history — all with the same client, as one unit of work.
  const row = await withTransaction(async (client) => {
    const current = await findById(id, client);
    if (!current) throw notFound(id);

    // All-or-nothing authorization: a single forbidden field rejects the
    // entire body with 403, and nothing is written.
    const wantsContent = changes.title !== undefined || changes.description !== undefined;
    if (wantsContent && !canEditContent(actor, current)) throw forbidden();
    if (changes.priority !== undefined && !canChangePriority(actor)) throw forbidden();
    if (changes.status !== undefined && !canChangeStatus(actor)) throw forbidden();

    if (isTerminal(current.status)) {
      throw new AppError('domain', 'REQUEST_IN_TERMINAL_STATUS',
        `Request ${id} is ${current.status} and can no longer be modified.`);
    }

    const statusChanges = changes.status !== undefined && changes.status !== current.status;
    if (statusChanges && !canTransition(current.status, changes.status)) {
      throw new AppError('domain', 'INVALID_STATUS_TRANSITION',
        `A request cannot move from ${current.status} to ${changes.status}.`);
    }

    const updated = await updateRequest(id, changes, client);
    if (statusChanges) {
      await insertStatusHistory(id, current.status, changes.status, actor.userId, client);
    }
    return updated;
  });

  return mapRequestRow(row);
}

export async function getHistory(actor, id) {
  // History is as private as the request itself: same 404 semantics.
  const request = await findById(id);
  if (!request || !canViewRequest(actor, request)) throw notFound(id);
  const rows = await findHistory(id);
  return rows.map(mapHistoryRow);
}