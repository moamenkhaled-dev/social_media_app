import { AppError } from "./app.errors.js";

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error", cause?: unknown) {
    super(500, message, { cause });
  }
}
