import type { HydratedDocument } from "mongoose";
import type { IGQqlContext } from "../../../common/types/gql.js";
import {
  GQLAuthentication,
  GraphQLAuthorization,
} from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { endpoints } from "../report.authorization.js";
import type {
  GraphQLReportDto,
  GraphQLTakeActionForModerationCaeDto,
  OpenModerationCaseDto,
  OpenReportDto,
} from "../report.js";
import { reportService } from "../report.service.js";
import { reportValidation } from "../report.validation.js";
import type { IReport } from "../../../common/interfaces/report.interfaces.js";
import type { IModerationCase } from "../../../common/interfaces/moderationCase.interface.js";

class ReportResolver {
  private readonly reportValidation = reportValidation;
  private readonly reportService = reportService;

  //report
  report = async (
    parent: any,
    { targetId, targetType, reason, customReason, snapshot }: GraphQLReportDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({ user, allowedRoles: endpoints.report });
    //validation
    const validatedData = await GQLValidate<GraphQLReportDto>({
      schema: this.reportValidation.report,
      args: { targetId, targetType, reason, customReason, snapshot },
    });
    //service
    await this.reportService.report({ user, ...validatedData });

    return { message: "Success" };
  };

  //open report
  openReport = async (
    parent: any,
    { reportId }: OpenReportDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: HydratedDocument<IReport> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({
      user,
      allowedRoles: endpoints.reportsAndModerationCases,
    });
    //validation
    const validatedData = await GQLValidate<OpenReportDto>({
      schema: reportValidation.openReport,
      args: { reportId },
    });
    //service
    const report = await this.reportService.openReport({ ...validatedData });

    return { message: "Success", data: report };
  };

  //open moderation case
  openModerationCase = async (
    parent: any,
    { moderationCaseId }: OpenModerationCaseDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: HydratedDocument<IModerationCase> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({
      user,
      allowedRoles: endpoints.reportsAndModerationCases,
    });
    //validation
    const validatedData = await GQLValidate<OpenModerationCaseDto>({
      schema: this.reportValidation.openModerationCase,
      args: { moderationCaseId },
    });
    //service
    const moderationCase = await this.reportService.openModerationCase({
      moderationCaseId,
    });

    return { message: "Success", data: moderationCase };
  };

  //take action for moderation case
  takeActionForModerationCase = async (
    parent: any,
    {
      moderationCaseId,
      action,
      customAction,
      status,
    }: GraphQLTakeActionForModerationCaeDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({
      user,
      allowedRoles: endpoints.takeActionForModerationCase,
    });
    //validation
    const validatedData =
      await GQLValidate<GraphQLTakeActionForModerationCaeDto>({
        schema: this.reportValidation.takeActionForModerationCae,
        args: { moderationCaseId, action, customAction, status },
      });
    //service
    await this.reportService.takeActionForModerationCase({
      user,
      moderationCaseId,
      action,
      customAction,
      status,
    });

    return { message: "Success" };
  };
}

export const reportResolver = new ReportResolver();
