import type { Types } from "mongoose";
import type {
  ReportActionEnum,
  ReportPriorityEnum,
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "../enums/report.enums.js";

export interface IReport {
  reporterId: Types.ObjectId;
  targetType: ReportTargetTypeEnum;
  targetId: Types.ObjectId;
  reason: ReportReasonEnum;
  customReason?: string | undefined;
  snapshot?: string | undefined;
  priority: ReportPriorityEnum;
  createdAt?: Date;
  updatedAt?: Date;
}
