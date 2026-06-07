import { model, Schema } from "mongoose";
import type { IModerationCase } from "../../../common/interfaces/moderationCase.interface.js";
import {
  ReportActionEnum,
  ReportPriorityEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "../../../common/enums/report.enums.js";

const moderationCaseSchema = new Schema<IModerationCase>(
  {
    targetType: {
      type: String,
      enum: ReportTargetTypeEnum,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      refPath: "targetType",
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ReportStatusEnum,
      default: ReportStatusEnum.PENDING,
    },
    actionTaken: {
      type: String,
      enum: ReportActionEnum,
      default: ReportActionEnum.NO_ACTION,
    },
    customAction: String,
    priority: {
      type: Number,
      enum: ReportPriorityEnum,
      default: ReportPriorityEnum.LOW,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this) {
        return this.status !== ReportStatusEnum.PENDING;
      },
    },
    reviewedAt: Date,
    reviewedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reportsCount: { type: Number, default: 0 },
    lastReason: String,
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

export const ModerationCase = model<IModerationCase>(
  "ModerationCase",
  moderationCaseSchema,
);
