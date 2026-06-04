import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

class BlockGraphQLArgs {
  //block
  block = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };

  //block list
  blockList = {
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    search: { type: GraphQLString },
  };
}

export const blockGraphQLArgs = new BlockGraphQLArgs();
