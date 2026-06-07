import type { Types } from "mongoose";
import type { CommentStatusEnum } from "../enums/comment.enums.js";

export interface IComment {
  authorId: Types.ObjectId;
  postId: Types.ObjectId;
  parentCommentId?: Types.ObjectId | string | null | undefined;
  content?: string | undefined;
  media?: Array<string>;
  likesCount?: number;
  repliesCount?: number;
  mentions?: Array<Types.ObjectId>;
  commentStatusEnum?: CommentStatusEnum;
  folderId: string;
  reportsCount?: number;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
