import { model, Schema, Types } from "mongoose";
import type { IStats } from "../../../common/interfaces/stats.interfaces.js";

const statsSchema = new Schema<IStats>(
  {
    ownerId: {
      type: Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    profileViewsCount: { type: Number, default: 0 },
    totalLikesReceived: { type: Number, default: 0 },
    totalCommentsReceived: { type: Number, default: 0 },
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

//export model
export const Stats = model<IStats>("Stats", statsSchema);
