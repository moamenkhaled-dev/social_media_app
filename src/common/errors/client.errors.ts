import { AppError } from "./app.errors.js";

//bad request
export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", cause?: unknown) {
    super(400, message, { cause });
  }
}

//not found
export class NotFoundError extends AppError {
  constructor(message: string = "Not Found", cause?: unknown) {
    super(404, message, { cause });
  }
}

//un authorized
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", cause?: unknown) {
    super(401, message, { cause });
  }
}

//forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", cause?: unknown) {
    super(403, message, { cause });
  }
}

//conflict
export class ConflictError extends AppError {
  constructor(message: string = "Conflict", cause?: unknown) {
    super(409, message, { cause });
  }
}

//too many requests
export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too Many Requests", cause?: unknown) {
    super(429, message, { cause });
  }
}

//validation error
export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", cause?: unknown) {
    super(422, message, { cause });
  }
}
