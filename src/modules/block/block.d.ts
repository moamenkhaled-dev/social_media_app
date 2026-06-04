import type z from "zod";
import type { blockValidation } from "./block.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type BlockDto = z.infer<typeof blockValidation.block> & IAuth;
export type GraphQLBlockDto = z.infer<typeof blockValidation.block>;

export type UnBlockDto = z.infer<typeof blockValidation.block> & IAuth;
export type GraphQLUnBlockDto = z.infer<typeof blockValidation.block>;

export type BlockListDto = z.infer<typeof blockValidation.blockList> & IAuth;
export type GraphQLBlockListDto = z.infer<typeof blockValidation.blockList>;
