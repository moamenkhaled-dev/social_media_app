import type { FollowStatusEnum } from "../../../common/enums/follow.enums.js";
import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type {
  IFollowersListResponse,
  IFollowingListResponse,
  IFollowRequestsListResponse,
} from "../follow.entity.js";
import type {
  GraphQLFollowersListDto,
  GraphQLFollowingListDto,
  GraphQLFollowRequestsListDto,
  GraphQLFollowUserDto,
} from "../follow.js";
import { followService } from "../follow.service.js";
import { followValidation } from "../follow.validation.js";

class FollowResolver {
  private readonly followValidation = followValidation;
  private readonly followService = followService;

  //follow user
  follow = async (
    parent: any,
    { targetUserId }: GraphQLFollowUserDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: FollowStatusEnum }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLFollowUserDto>({
      schema: this.followValidation.followUser,
      args: { targetUserId },
    });
    //service
    const { status } = await this.followService.follow({
      user,
      targetUserId,
    });

    return { message: "success", data: status };
  };

  //un follow user
  unFollow = async (
    parent: any,
    { targetUserId }: GraphQLFollowUserDto,
    context: IGQqlContext,
  ): Promise<any> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLFollowUserDto>({
      schema: followValidation.followUser,
      args: { targetUserId },
    });
    //service
    await this.followService.unFollow({
      user,
      targetUserId,
    });

    return { message: "UnFollowed" };
  };

  //reject follow request
  rejectFollowRequest = async (
    parent: any,
    { targetUserId }: GraphQLFollowUserDto,
    context: IGQqlContext,
  ): Promise<any> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLFollowUserDto>({
      schema: followValidation.followUser,
      args: { targetUserId },
    });
    //service
    await this.followService.rejectFollowRequest({ user, targetUserId });

    return { message: "rejected successfully" };
  };

  //accept follow request
  acceptFollowRequest = async (
    parent: any,
    { targetUserId }: GraphQLFollowUserDto,
    context: IGQqlContext,
  ): Promise<any> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLFollowUserDto>({
      schema: followValidation.followUser,
      args: { targetUserId },
    });
    //service
    await this.followService.acceptFollowRequest({ user, targetUserId });

    return { message: "accepted successfully" };
  };

  //followers list
  followersList = async (
    parent: any,
    { targetUserId, page, limit, search }: GraphQLFollowersListDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: Array<IFollowersListResponse> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLFollowersListDto>({
      schema: followValidation.followersList,
      args: { targetUserId, page, limit, search },
    });
    //service
    const followers = await this.followService.followersList({
      user,
      ...validatedData,
    });

    return { message: "Success", data: followers };
  };

  //following list
  followingList = async (
    parent: any,
    { targetUserId, page, limit, search }: GraphQLFollowingListDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: Array<IFollowingListResponse> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLFollowingListDto>({
      schema: this.followValidation.followersList,
      args: { targetUserId, page, limit, search },
    });
    //service
    const followingList = await this.followService.followingList({
      user,
      ...validatedData,
    });

    return { message: "Success", data: followingList };
  };

  //follow requests list
  followRequestsList = async (
    parent: any,
    { page, limit, search }: GraphQLFollowRequestsListDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: Array<IFollowRequestsListResponse> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLFollowRequestsListDto>({
      schema: this.followValidation.followRequestsList,
      args: { page, limit, search },
    });
    //service
    const followingList = await this.followService.followRequestsList({
      user,
      ...validatedData,
    });

    return { message: "Success", data: followingList };
  };
}

export const followResolver = new FollowResolver();
