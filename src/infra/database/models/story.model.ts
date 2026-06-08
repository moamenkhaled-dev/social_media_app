import { model, Schema, Types } from "mongoose";
import type {
  ILike,
  IStory,
} from "../../../common/interfaces/story.interface.js";
import { LikeEnum } from "../../../common/enums/story.enums.js";

const likeSchema = new Schema<ILike>({
  actorId: { type: Types.ObjectId, ref: "User" },
  like: { type: String, enum: LikeEnum },
});

const storySchema = new Schema<IStory>(
  {
    ownerId: { type: Types.ObjectId, ref: "User", required: true },
    content: String,
    media: String,
    likes: [likeSchema],
    expiredAt: { type: Date, required: true },
    likesCount: { type: Number, default: 0 },
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
storySchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

export const Story = model<IStory>("Story", storySchema);
