import type z from "zod";
import type { userValidationSchema } from "./user.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type LogoutDto = z.infer<typeof userValidationSchema.logout> & IAuth;

export type GraphQLLogoutDto = z.infer<typeof userValidationSchema.logout>;
