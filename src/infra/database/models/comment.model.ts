import { model, Schema, Types } from "mongoose";
import type { IComment } from "../../../common/interfaces/comment.interfaces.js";
import { CommentStatusEnum } from "../../../common/enums/comment.enums.js";

const commentSchema = new Schema<IComment>(
  {
    authorId: { type: Types.ObjectId, ref: "User", required: true },
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    parentCommentId: { type: Types.ObjectId, ref: "Comment" },
    content: { type: String, required: true },
    media: [String],
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    mentions: { type: [Types.ObjectId], ref: "User" },
    folderId: { type: String, required: true },
    commentStatusEnum: {
      type: String,
      enum: CommentStatusEnum,
      default: CommentStatusEnum.ACTIVE,
    },
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

//export model
export const Comment = model<IComment>("Comment", commentSchema);
