import type { Types } from "mongoose";
import type { ChatTypeEnum } from "../enums/chat.enums.js";

export interface IChat {
  participants: Array<Types.ObjectId>;
  type: ChatTypeEnum;
  lastMessage?: string;
  groupName?: string;
  groupImage?: string | undefined;
  roomId?: string;
  creator?: Types.ObjectId;
  admins?: Array<Types.ObjectId>;
  deletedAt?: Date;
  restoredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
