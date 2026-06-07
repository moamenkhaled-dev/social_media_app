import type { Types } from "mongoose";
import type {
  ReportActionEnum,
  ReportPriorityEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "../enums/report.enums.js";

export interface IModerationCase {
  targetId: Types.ObjectId;
  targetType: ReportTargetTypeEnum;
  reportsCount: number;
  priority: ReportPriorityEnum;
  status: ReportStatusEnum;
  actionTaken?: ReportActionEnum;
  customAction?: string;
  lastReason?: string;
  actorId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
