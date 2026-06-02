import { model, Schema, Types } from "mongoose";
import type {
  IData,
  INotification,
} from "../../../common/interfaces/notification.interfaces.js";
import {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../../../common/enums/notification.enums.js";

const dataSchema = new Schema<IData>({
  postId: { type: Types.ObjectId, ref: "Post" },
  commentId: { type: Types.ObjectId, ref: "Comment" },
  messageId: { type: Types.ObjectId, ref: "Message" },
  username: String,
  avatarUrl: String,
});

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Types.ObjectId,
      ref: "User",
    },
    actorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    notificationType: {
      type: String,
      enum: NotificationTypeEnum,
      required: true,
    },
    notificationTargetType: {
      type: String,
      enum: NotificationTargetTypeEnum,
      required: true,
    },
    // notificationTargetId: {
    //   type: Types.ObjectId,
    //   refPath: "notificationTargetType",
    //   required: true,
    // },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    data: dataSchema,
    readAt: Date,
    pushStatus: {
      type: String,
      enum: PushStatusEnum,
      default: PushStatusEnum.PENDING,
    },
    pushSentAt: {
      type: Date,
      default: new Date(),
    },
    createdByAdmin: { type: Types.ObjectId, ref: "User" },
    notificationKey: { type: String },
    deletedAt: Date,
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

//indexes
// notificationSchema.index({ notificationKey: 1 }, { unique: true });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);
