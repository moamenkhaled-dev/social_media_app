import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import {
  ReportActionEnum,
  ReportReasonEnum,
  ReportStatusEnum,
} from "../../common/enums/report.enums.js";

class ReportValidation {
  //create report
  report = z
    .strictObject({
      reason: generalValidationFields.reason,
      customReason: generalValidationFields.nullString.optional(),
      snapshot: generalValidationFields.nullString.optional(),
      targetType: generalValidationFields.reportTargetType,
      targetId: generalValidationFields.id,
    })
    .superRefine((fields, ctx) => {
      if (fields.reason === ReportReasonEnum.OTHER && !fields.customReason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: `you should add reason`,
        });
      }

      if (!fields.reason && !fields.customReason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: `you should add reason`,
        });
      }

      if (fields.reason !== ReportReasonEnum.OTHER && fields.customReason) {
        ctx.addIssue({
          code: "custom",
          path: ["reason"],
          message: `you can't write custom reason choose other to have the ability to write custom reason`,
        });
      }
    });

  //open report
  openReport = z.strictObject({ reportId: generalValidationFields.id });

  //open moderation case
  openModerationCase = z.strictObject({
    moderationCaseId: generalValidationFields.id,
  });

  //review moderation case
  reviewModerationCase = z.strictObject({
    moderationCaseId: generalValidationFields.id,
  });

  //take action for moderation case
  takeActionForModerationCae = z
    .strictObject({
      moderationCaseId: generalValidationFields.id,
      action: generalValidationFields.reportAction.optional(),
      customAction: generalValidationFields.string(5, 50).optional(),
      status: generalValidationFields.reportStatus,
    })
    .superRefine((fields, ctx) => {
      if (fields.action === ReportActionEnum.NO_ACTION) {
        ctx.addIssue({
          code: "custom",
          path: ["action"],
          message: `You should add action`,
        });
      }
      if (fields.action !== ReportActionEnum.OTHER && fields.customAction) {
        ctx.addIssue({
          code: "custom",
          path: ["action"],
          message: `You can't add custom action when you choose action`,
        });
      }
      if (fields.action === ReportActionEnum.OTHER && !fields.customAction) {
        ctx.addIssue({
          code: "custom",
          path: ["action"],
          message: `You should add custom action if you choose other`,
        });
      }
      if (
        fields.action !== ReportActionEnum.OTHER &&
        fields.status === ReportStatusEnum.REJECTED
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message: `You can't put action for Rejected moderation case`,
        });
      }
      if (fields.status == ReportStatusEnum.PENDING) {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message: `You can't add status pending`,
        });
      }
    });
}

export const reportValidation = new ReportValidation();
