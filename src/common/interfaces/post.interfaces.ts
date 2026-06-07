import type { Types } from "mongoose";
import type {
  MediaTypeEnum,
  PostStatusEnum,
  PostVisibilityEnum,
} from "../enums/post.enums.js";

export interface IPost {
  authorId: Types.ObjectId;
  folderId?: string | undefined;
  content?: string | undefined;
  media?: Array<string>;
  postVisibility?: PostVisibilityEnum | undefined;
  likesCount?: number | undefined;
  commentsCount?: number | undefined;
  sharesCount?: number | undefined;
  viewsCount?: number | undefined;
  tags?: Array<Types.ObjectId | string> | undefined;
  mentions?: Array<Types.ObjectId> | undefined;
  postStatus?: PostStatusEnum | undefined;
  reportsCount?: number;
  deletedAt?: Date | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}
