import type z from "zod";
import type { profileValidationSchema } from "./profile.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type GetProfileByIdDto = z.infer<
  typeof profileValidationSchema.getProfileById
> &
  IAuth;

export type GraphQLGetProfileByIdDto = z.infer<
  typeof profileValidationSchema.getProfileById
>;

export type GetStatsDto = z.infer<typeof profileValidationSchema.getStats>;
