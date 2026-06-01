import z from "zod";
import { PaginateDefault } from "../constants/paginate.constants.js";

export const PaginateValidation = z.strictObject({
  page: z.coerce.number().default(PaginateDefault.PAGE).optional(),
  limit: z.coerce.number().default(PaginateDefault.LIMIT).optional(),
  search: z.string().optional(),
});

export type PaginateDto = z.infer<typeof PaginateValidation>;
