import type { Types } from "mongoose";

export interface IFollowersListResponse {
  followerId: Types.ObjectId;
  follower: {
    username: string;
    avatarUrl: string;
  };
}
export interface IFollowingListResponse {
  followingId: Types.ObjectId;
  following: {
    username: string;
    avatarUrl: string;
  };
}

export interface IFollowRequestsListResponse {
  requesterId: Types.ObjectId;
  requester: {
    username: string;
    avatarUrl: string;
  };
}
