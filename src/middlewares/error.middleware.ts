import type { NextFunction, Request, Response } from "express";
import { NODE_ENV } from "../config/config.js";

interface IError extends Error {
  status: number;
}

export const GlobalErrorMiddleware = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status;
  const message = error.message || "Internal Server Error";
  const stack = NODE_ENV === "dev" ? error.stack : undefined;
  const cause = error.cause;

  res.status(status || 500).json({
    success: false,
    message,
    stack,
    cause,
    error: NODE_ENV === "dev" ? error : undefined,
  });
};
