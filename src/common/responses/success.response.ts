import type { Response } from "express";

export const successResponse = <T = any>({
  res,
  status = 200,
  message = "Success",
  data,
}: {
  res: Response;
  status?: number;
  message?: string;
  data?: T;
}) => {
  return res.status(status).json({ success: true, status, message, data });
};
