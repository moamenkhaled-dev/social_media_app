import type { Types } from "mongoose";
import type { InvitationStatusEnum } from "../enums/invitation.enums.js";

export interface IInvitation {
  chatId: Types.ObjectId | undefined;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: InvitationStatusEnum;
}
