// TODO: coordination layer. It applies process rules, validates transitions
// and defines units of work. NO SQL and NO HTTP status codes here: throw
// typed errors and let the routes translate them.
//
// Suggested shape (matches persistence-contract.md):
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
//
// The AppError class below is ready: category decides the HTTP translation
// ('contract' -> 400, 'resource' -> 404, 'domain' -> 409).

export class AppError extends Error {
  constructor(category, code, message) {
    super(message);
    this.category = category;
    this.code = code;
  }
}

// TODO: implement the five operations. Start with listRequests and
// getRequest (read-only), then createRequest, then patchRequest.
