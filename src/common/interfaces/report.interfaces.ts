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
  customReason?: string;
  description?: string;
  snapshot?: {
    text?: string;
    mediaUrl?: string;
    username?: string;
  };
  status: ReportStatusEnum;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  actionTaken?: ReportActionEnum;
  isDuplicate: boolean;
  duplicateOf?: Array<Types.ObjectId>;
  priority: ReportPriorityEnum;
  createdAt?: Date;
  updatedAt?: Date;
}
