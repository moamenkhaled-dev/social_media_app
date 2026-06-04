import { GraphQLString } from "graphql";
import { followGraphQLType } from "./follow.types.gql.js";
import { followGraphQLArgs } from "./follow.args.gql.js";
import { followResolver } from "./follow.resolver.js";

class FollowGraphQLSchema {
  private readonly followGraphQLType = followGraphQLType;
  private readonly followGraphQLArgs = followGraphQLArgs;
  private readonly followResolver = followResolver;

  //query
  registerQuery() {
    return {
      //followers list
      followersList: {
        description: "accept follow request",
        type: this.followGraphQLType.followersList,
        args: this.followGraphQLArgs.followList,
        resolve: this.followResolver.followersList,
      },

      //following list
      followingList: {
        description: `following list of target user`,
        type: this.followGraphQLType.followingList,
        args: this.followGraphQLArgs.followList,
        resolve: this.followResolver.followingList,
      },

      //follow requests list
      followRequestsList: {
        description: `follow requests list of current user`,
        type: this.followGraphQLType.followRequestsList,
        args: this.followGraphQLArgs.followRequestsList,
        resolve: this.followResolver.followRequestsList,
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      //follow user
      follow: {
        description: "follow user",
        type: this.followGraphQLType.follow,
        args: this.followGraphQLArgs.follow,
        resolve: this.followResolver.follow,
      },

      //unFollow
      unFollow: {
        description: "un follow user",
        type: this.followGraphQLType.unFollow,
        args: this.followGraphQLArgs.follow,
        resolve: this.followResolver.unFollow,
      },

      //reject follow request
      rejectFollowRequest: {
        description: "reject follow request",
        type: this.followGraphQLType.followRequest,
        args: this.followGraphQLArgs.follow,
        resolve: this.followResolver.rejectFollowRequest,
      },

      //accept follow request
      acceptFollowRequest: {
        description: "accept follow request",
        type: this.followGraphQLType.followRequest,
        args: this.followGraphQLArgs.follow,
        resolve: this.followResolver.acceptFollowRequest,
      },
    };
  }
}

export const followGraphQLSchema = new FollowGraphQLSchema();
