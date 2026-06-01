import type { Request, Response } from "express";

export interface IGQqlContext {
  req: { raw: Request };
  res: Response;
}
