import type z from "zod";
import type { adminValidation } from "./admin.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type BanDto = z.infer<typeof adminValidation.ban> & IAuth;
export type GraphQLBanDto = z.infer<typeof adminValidation.ban>;

export type UnBanDto = z.infer<typeof adminValidation.unBan> & IAuth;
export type GraphQLUnBanDto = z.infer<typeof adminValidation.unBan>;

export type BannedUsersListDto = z.infer<
  typeof adminValidation.bannedUsersList
>;

export type AdminDeleteUserDto = z.infer<
  typeof adminValidation.adminDeleteUser
>;
