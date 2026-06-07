import { model, Schema, Types } from "mongoose";
import type { IChat } from "../../../common/interfaces/chat.interface.js";
import { ChatTypeEnum } from "../../../common/enums/chat.enums.js";
import { BadRequestError } from "../../../common/errors/client.errors.js";

const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ChatTypeEnum, required: true },
    lastMessage: String,
    creator: {
      type: Types.ObjectId,
      ref: "User",
      required: function (this) {
        return this.type === ChatTypeEnum.OVM;
      },
    },
    admins: [{ type: Types.ObjectId, ref: "User" }],
    groupName: {
      type: String,
      required: function (this) {
        return this.type === ChatTypeEnum.OVM;
      },
    },
    groupImage: String,
    roomId: {
      type: String,
      required: function (this) {
        return this.type === ChatTypeEnum.OVM;
      },
    },
    reportsCount: { type: Number, default: 0 },
    deletedAt: Date,
    restoredAt: Date,
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

//virtual relation
chatSchema.virtual("messages", {
  localField: "_id",
  foreignField: "chatId",
  ref: "Message",
});

//pre validate
chatSchema.pre("validate", function () {
  if (
    this.type === ChatTypeEnum.OVO &&
    (this.groupName ||
      this.groupImage ||
      this.roomId ||
      this.creator ||
      this.admins?.length)
  ) {
    throw new BadRequestError(`can't assign group fields to OVO chat`);
  }
});

export const Chat = model<IChat>("Chat", chatSchema);
