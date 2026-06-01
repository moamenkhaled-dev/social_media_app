import { model, Schema, Types } from "mongoose";
import type { IInvitation } from "../../../common/interfaces/invitation.interface.js";
import { InvitationStatusEnum } from "../../../common/enums/invitation.enums.js";

const invitationSchema = new Schema<IInvitation>({
  chatId: { type: Types.ObjectId, ref: "Chat", required: true },
  senderId: { type: Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: InvitationStatusEnum,
    default: InvitationStatusEnum.PENDING,
  },
});

export const Invitation = model<IInvitation>("Invitation", invitationSchema);
