import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";

class PostGraphQLArgs {
  //posts list
  postsList = {
    targetUserId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    search: { type: GraphQLString },
  };

  //get pos by id
  getPostById = {
    targetUserId: { type: new GraphQLNonNull(GraphQLID) },
    postId: { type: new GraphQLNonNull(GraphQLID) },
  };
}

export const postGraphQLArgs = new PostGraphQLArgs();
