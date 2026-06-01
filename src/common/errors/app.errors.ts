export class AppError extends Error {
  constructor(
    public status: number,
    message?: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}
