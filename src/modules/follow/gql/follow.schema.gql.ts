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
      //dummy
      dummyFollow: {
        description: "Dummy query for testing",
        type: GraphQLString,
        resolve: () => "Follow module is working 🚀",
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

      //followers list
      followersList: {
        description: "accept follow request",
        type: this.followGraphQLType.followersList,
        args: this.followGraphQLArgs.followersList,
        resolve: this.followResolver.followersList,
      },
    };
  }
}

export const followGraphQLSchema = new FollowGraphQLSchema();
