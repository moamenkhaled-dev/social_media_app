import type { Types } from "mongoose";
import type { MessageTypeEnum } from "../enums/message.enums.js";

export interface IMessage {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageTypeEnum;
  invitationId?: Types.ObjectId | string;
  content?: string;
  attachments?: Array<string>;
  replyToMessageId?: Types.ObjectId | null;
  isEdited?: boolean;
  reportsCount?: number;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
