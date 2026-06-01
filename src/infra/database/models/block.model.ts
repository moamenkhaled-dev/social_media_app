import { model, Schema, Types } from "mongoose";
import type { IBlock } from "../../../common/interfaces/block.interface.js";

const blockSchema = new Schema<IBlock>(
  {
    blockerId: { type: Types.ObjectId, ref: "User", required: true },
    blockedId: { type: Types.ObjectId, ref: "User", required: true },
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
blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

//export model
export const Block = model<IBlock>("Block", blockSchema);
