import type { Types } from "mongoose";
import type { FollowStatusEnum } from "../enums/follow.enums.js";

export interface IFollow {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  followStatus: FollowStatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
}
