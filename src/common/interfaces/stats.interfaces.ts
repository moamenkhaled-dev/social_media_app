import type { Types } from "mongoose";

export interface IStats {
  ownerId: Types.ObjectId;
  followersCount?: number;
  followingCount?: number;
  profileViewsCount?: number;
  totalLikesReceived?: number;
  totalCommentsReceived?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
