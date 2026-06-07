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
  OPENED = "OPENED",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export enum ReportActionEnum {
  NO_ACTION = "NoAction",
  CONTENT_REMOVED = "ContentRemoved",
  CONTENT_RESTRICTED = "ContentRestricted",
  WARNING_ISSUED = "WarningIssued",
  USER_MUTED = "UserMuted",
  USER_SUSPENDED = "UserSuspended",
  USER_BANNED = "UserBanned",
  ACCOUNT_DEACTIVATED = "AccountDeactivated",
  REPORT_DUPLICATE = "ReportDuplicate",
  ESCALATED = "Escalated",
  OTHER = "Other",
}

export enum ReportPriorityEnum {
  LOW = 3,
  MEDIUM = 2,
  HIGH = 1,
  CRITICAL = 0,
}

export enum ReportTargetTypeEnum {
  USER = "User",
  POST = "Post",
  CHAT = "Chat",
  COMMENT = "Comment",
  MESSAGE = "Message",
}
