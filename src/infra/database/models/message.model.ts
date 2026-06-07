import { model, Schema, Types } from "mongoose";
import type { IMessage } from "../../../common/interfaces/message.interface.js";
import { MessageTypeEnum } from "../../../common/enums/message.enums.js";

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: MessageTypeEnum, required: true },
    content: {
      type: String,
      required: function (this) {
        if (this.type === MessageTypeEnum.INVITATION) return false;
        if (this.attachments?.length) return false;
        return true;
      },
    },
    invitationId: {
      type: Types.ObjectId,
      ref: "Invitation",
      required: function (this) {
        return this.type === MessageTypeEnum.INVITATION;
      },
    },
    attachments: [String],
    replyToMessageId: { type: Types.ObjectId, ref: "Message" },
    isEdited: Boolean,
    reportsCount: { type: Number, default: 0 },
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
messageSchema.index({ chatId: 1, createdAt: -1 });

//virtual relations
messageSchema.virtual("sender", {
  localField: "senderId",
  foreignField: "_id",
  ref: "User",
});

export const Message = model<IMessage>("Message", messageSchema);
