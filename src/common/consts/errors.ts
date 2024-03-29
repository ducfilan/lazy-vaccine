export class ApiError extends Error {
  constructor(message = "", ...args: []) {
    super(message, ...args)
  }
}

export class ParamError extends Error {
  constructor(message = "", ...args: []) {
    super(message, ...args)
  }
}

export class NotSubscribedError extends Error {
  constructor(message = "", ...args: []) {
    super(message, ...args)
  }
}

export class NotLoggedInError extends Error {
  constructor(message = "", ...args: []) {
    super(message, ...args)
  }
}
