//type
export enum NotificationTypeEnum {
  LIKE = "Like",
  COMMENT = "Comment",
  FOLLOW = "Follow",
  MENTION = "Mention",
  MESSAGE = "Message",
  CHAT = "Chat",
  SYSTEM = "System",
}

export enum NotificationTargetTypeEnum {
  POST = "Post",
  COMMENT = "Comment",
  USER = "User",
  MESSAGE = "Message",
  CHAT = "Chat",
}

//status
export enum PushStatusEnum {
  PENDING = "Pending",
  PARTIAL = "Partial",
  SENT = "Sent",
  FAILED = "Failed",
}
