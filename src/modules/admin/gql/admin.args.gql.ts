import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

class AdminGraphQLArgs {
  //bam
  ban = {
    targetUserId: { type: new GraphQLNonNull(GraphQLID) },
    banReason: { type: new GraphQLNonNull(GraphQLString) },
  };

  //unBam
  unBan = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };

  //banned users list
  bannedUsersList = {
    page: { type: GraphQLInt, limit: GraphQLInt, search: GraphQLString },
  };
}

export const adminGraphQLArgs = new AdminGraphQLArgs();
