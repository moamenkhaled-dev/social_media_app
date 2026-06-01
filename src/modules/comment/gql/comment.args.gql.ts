import { GraphQLID, GraphQLInt, GraphQLNonNull } from "graphql";

class GraphQLCommentArgs {
  //get post
  getComment = {
    commentId: { type: new GraphQLNonNull(GraphQLID) },
  };

  //comments list
  commentsList = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  };
}

export const graphQLCommentArgs = new GraphQLCommentArgs();
