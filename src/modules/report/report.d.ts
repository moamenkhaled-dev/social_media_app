import type z from "zod";
import type { reportValidation } from "./report.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type ReportDto = z.infer<typeof reportValidation.report> & IAuth;
export type GraphQLReportDto = z.infer<typeof reportValidation.report>;

export type OpenReportDto = z.infer<typeof reportValidation.openReport>;

export type OpenModerationCaseDto = z.infer<
  typeof reportValidation.openModerationCase
>;

export type TakeActionForModerationCaeDto = z.infer<
  typeof reportValidation.takeActionForModerationCae
> &
  IAuth;
export type GraphQLTakeActionForModerationCaeDto = z.infer<
  typeof reportValidation.takeActionForModerationCae
>;
