import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

class FollowGraphQLArgs {
  //follow user
  follow = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };

  //followers list
  followList = {
    targetUserId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    search: { type: GraphQLString },
  };

  //follow requests list
  followRequestsList = {
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    search: { type: GraphQLString },
  };
}

export const followGraphQLArgs = new FollowGraphQLArgs();
