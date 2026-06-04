import type { Types } from "mongoose";

export interface IBlockListResponse {
  blockedId: Types.ObjectId | string;
  blocked: {
    username: string;
    avatarUrl: string;
  };
}
