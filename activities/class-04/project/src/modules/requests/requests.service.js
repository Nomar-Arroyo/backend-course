// Coordination layer. It applies process rules, validates transitions
// and defines units of work. NO SQL and NO HTTP status codes here: throw
// typed errors and let the routes translate them.
//
//   listRequests(filters)  -> representations[]      (validate filter values -> contract error)
//   getRequest(id)         -> representation         (missing -> resource error)
//   createRequest(input)   -> representation
//       - title required, priority validated, defaults applied
//       - UNIT OF WORK: insert request + insert birth history (NULL -> open)
//   patchRequest(id, body) -> representation
//       - collect updatable fields; shape validation -> contract errors
//       - UNIT OF WORK: read current + validate transition/terminal
//         (domain errors) + update + insert history, all with ONE client
//   getHistory(id)         -> history representations[] (missing request -> resource error)

import * as store from "./requests.store.js";
import { mapRequestRow, mapHistoryRow } from "./request.mapper.js";
import {
  STATUSES,
  isValidStatus,
  isValidPriority,
  isTerminal,
  canTransition
} from "./request-status.js";
import { withTransaction } from "../../database/transaction.js";

export class AppError extends Error {
  constructor(category, code, message) {
    super(message);
    this.category = category;
    this.code = code;
  }
}

const PRIORITIES = ["low", "medium", "high"];
const UPDATABLE_FIELDS = ["title", "description", "priority", "status"];

export async function listRequests(filters) {
  const { status, priority } = filters;

  if (status !== undefined && !isValidStatus(status)) {
    throw new AppError(
      "contract",
      "INVALID_STATUS",
      `"${status}" is not a valid status filter`
    );
  }

  if (priority !== undefined && !isValidPriority(priority)) {
    throw new AppError(
      "contract",
      "INVALID_PRIORITY",
      `"${priority}" is not a valid priority filter`
    );
  }

  const rows = await store.findAll({ status, priority });
  return rows.map(mapRequestRow);
}

export async function getRequest(id) {
  const row = await store.findById(id);
  if (!row) {
    throw new AppError("resource", "REQUEST_NOT_FOUND", `Request ${id} was not found`);
  }
  return mapRequestRow(row);
}

export async function createRequest(input) {
  const { title, description, priority } = input;

  if (typeof title !== "string" || title.trim() === "") {
    throw new AppError("contract", "MISSING_TITLE", "Title is required");
  }

  if (priority !== undefined && !isValidPriority(priority)) {
    throw new AppError(
      "contract",
      "INVALID_PRIORITY",
      `"${priority}" is not a valid priority`
    );
  }

  const prepared = {
    title: title.trim(),
    description: typeof description === "string" ? description : "",
    priority: priority ?? "medium"
  };

  // UNIT OF WORK: the request and its birth history are one unit. Both are
  // written with the SAME transaction client; if the history insert fails,
  // the request is rolled back too.
  const row = await withTransaction(async (client) => {
    const created = await store.insertRequest(prepared, client);
    await store.insertStatusHistory(created.id, null, created.status, client);
    return created;
  });

  return mapRequestRow(row);
}

export async function patchRequest(id, body) {
  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) changes[field] = body[field];
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError(
      "contract",
      "EMPTY_PATCH",
      `The body must include at least one of: ${UPDATABLE_FIELDS.join(", ")}.`
    );
  }

  if (changes.title !== undefined &&
      (typeof changes.title !== "string" || changes.title.trim() === "")) {
    throw new AppError("contract", "MISSING_TITLE", "Title is required");
  }

  if (changes.priority !== undefined && !isValidPriority(changes.priority)) {
    throw new AppError(
      "contract",
      "INVALID_PRIORITY",
      `"${changes.priority}" is not a valid priority`
    );
  }

  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    throw new AppError(
      "contract",
      "INVALID_STATUS",
      `"${changes.status}" is not a valid status. Valid: ${STATUSES.join(", ")}.`
    );
  }

  if (changes.title !== undefined) changes.title = changes.title.trim();

  // UNIT OF WORK: read the current state + validate domain rules + update +
  // record the transition, all with ONE client. The read is INSIDE the
  // transaction so the validation and the write see the same snapshot.
  const row = await withTransaction(async (client) => {
    const current = await store.findById(id, client);
    if (!current) {
      throw new AppError("resource", "REQUEST_NOT_FOUND", `Request ${id} was not found`);
    }

    // A terminal status protects every field, not only status.
    if (isTerminal(current.status)) {
      throw new AppError(
        "domain",
        "REQUEST_IN_TERMINAL_STATUS",
        `Request ${id} is in a terminal status`
      );
    }

    const newStatus = changes.status;
    if (newStatus !== undefined && newStatus !== current.status &&
        !canTransition(current.status, newStatus)) {
      throw new AppError(
        "domain",
        "INVALID_STATUS_TRANSITION",
        `Cannot move a request from ${current.status} to ${newStatus}`
      );
    }

    const updated = await store.updateRequest(id, changes, client);

    if (newStatus !== undefined && newStatus !== current.status) {
      await store.insertStatusHistory(id, current.status, newStatus, client);
    }

    return updated;
  });

  return mapRequestRow(row);
}

export async function getHistory(id) {
  const row = await store.findById(id);
  if (!row) {
    throw new AppError("resource", "REQUEST_NOT_FOUND", `Request ${id} was not found`);
  }

  const rows = await store.findHistory(id);
  return rows.map(mapHistoryRow);
}