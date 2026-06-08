import type { Types } from "mongoose";

import type { LikeEnum } from "../enums/story.enums.js";

export interface ILike {
  actorId: Types.ObjectId;
  like: LikeEnum;
}

export interface IStory {
  ownerId: Types.ObjectId;
  content?: string;
  media?: string;
  likes?: Array<ILike>;
  likesCount?: number;
  expiredAt: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
