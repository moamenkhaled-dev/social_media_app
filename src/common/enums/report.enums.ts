export enum ReportReasonEnum {
  SPAM = "SPAM",
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  NUDITY = "NUDITY",
  VIOLENCE = "VIOLENCE",
  SCAM = "SCAM",
  COPYRIGHT = "COPYRIGHT",
  IMPERSONATION = "IMPERSONATION",
  OTHER = "OTHER",
}

export enum ReportStatusEnum {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export enum ReportActionEnum {
  NONE = "NONE",
  WARNED = "WARNED",
  HIDDEN = "HIDDEN",
  DELETED = "DELETED",
  BANNED = "BANNED",
}

export enum ReportPriorityEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum ReportTargetTypeEnum {
  USER = "USER",
  POST = "POST",
  COMMENT = "COMMENT",
  MESSAGE = "MESSAGE",
}
