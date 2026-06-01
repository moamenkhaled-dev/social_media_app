import { Schema, model } from "mongoose";
import type { IReport } from "../../../common/interfaces/report.interfaces.js";
import {
  ReportActionEnum,
  ReportPriorityEnum,
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "../../../common/enums/report.enums.js";

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ReportTargetTypeEnum,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      refPath: "targetType",
      required: true,
    },
    reason: {
      type: String,
      enum: ReportReasonEnum,
      required: true,
    },
    customReason: {
      type: String,
      trim: true,
      required: function () {
        return this.reason === ReportReasonEnum.OTHER;
      },
    },
    description: {
      type: String,
      trim: true,
    },
    snapshot: {
      text: { type: String, trim: true },
      mediaUrl: { type: String, trim: true },
      username: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ReportStatusEnum,
      default: ReportStatusEnum.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    actionTaken: {
      type: String,
      enum: ReportActionEnum,
      default: ReportActionEnum.NONE,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: [
      {
        type: Schema.Types.ObjectId,
        ref: "Report",
      },
    ],
    priority: {
      type: String,
      enum: ReportPriorityEnum,
      default: ReportPriorityEnum.LOW,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Report = model<IReport>("Report", reportSchema);
