import type { Types } from "mongoose";

export interface IBannedUsersListResponse {
  _id: Types.ObjectId;
  user: {
    username: string;
    avatarUrl: string;
  };
}
