import type z from "zod";
import type { followValidation } from "./follow.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type FollowUserDto = z.infer<typeof followValidation.followUser> & IAuth;
export type GraphQLFollowUserDto = z.infer<typeof followValidation.followUser>;

export type FollowersListDto = z.infer<typeof followValidation.followersList> &
  IAuth;
export type GraphQLFollowersListDto = z.infer<
  typeof followValidation.followersList
>;

export type FollowingListDto = z.infer<typeof followValidation.followersList> &
  IAuth;
export type GraphQLFollowingListDto = z.infer<
  typeof followValidation.followersList
>;

export type FollowRequestsListDto = z.infer<
  typeof followValidation.followRequestsList
> &
  IAuth;
export type GraphQLFollowRequestsListDto = z.infer<
  typeof followValidation.followRequestsList
>;
