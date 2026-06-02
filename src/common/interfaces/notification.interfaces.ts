import type { Types } from "mongoose";
import type {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../enums/notification.enums.js";

export interface IData {
  postId?: Types.ObjectId | undefined;
  commentId?: Types.ObjectId | undefined;
  messageId?: Types.ObjectId | undefined;
  username?: string | undefined;
  avatarUrl?: string | undefined;
}

export interface INotification {
  recipientId?: Types.ObjectId | string | undefined;
  actorId: Types.ObjectId;
  notificationType: NotificationTypeEnum;
  notificationTargetType: NotificationTargetTypeEnum;
  notificationTargetId: Types.ObjectId;
  title: string;
  body: string;
  data?: IData | undefined;
  readAt?: Date | undefined;
  pushStatus?: PushStatusEnum | undefined;
  pushSentAt?: Date | undefined;
  createdByAdmin?: Types.ObjectId | undefined;
  notificationKey?: string;
  deletedAt?: Date | undefined;
  createdAt?: Date | undefined;
}

export interface ISendMultipleNotificationsData {
  userIds: Array<Types.ObjectId | string>;
  title: string;
  body: string;
  notificationId: Types.ObjectId | string;
}
