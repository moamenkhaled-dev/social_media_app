import type z from "zod";
import type { settingsValidation } from "./settings.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type UpdateSettingsDto = z.infer<
  typeof settingsValidation.updateSettings
> &
  IAuth;
export type GraphQLUpdateSettingsDto = z.infer<
  typeof settingsValidation.updateSettings
>;
