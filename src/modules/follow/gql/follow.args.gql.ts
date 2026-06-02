import { GraphQLID, GraphQLInt, GraphQLNonNull } from "graphql";

class FollowGraphQLArgs {
  //follow user
  follow = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };

  //followers list
  followersList = {
    targetUserId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    search: { type: GraphQLInt },
  };
}

export const followGraphQLArgs = new FollowGraphQLArgs();
