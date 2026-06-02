import type { Types } from "mongoose";

export interface IFollowersListResponse {
  followerId: Types.ObjectId;
  follower: {
    username: string;
    avatarUrl: string;
  };
}
