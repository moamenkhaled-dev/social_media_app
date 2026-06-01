import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class PostGraphQLType {
  private readonly graphQLType = graphQLTypes;

  //posts list
  postsList = new GraphQLObjectType({
    name: `postsListGraphQLType`,
    fields: {
      message: { type: this.graphQLType.messageType },
      data: {
        type: new GraphQLObjectType({
          name: "postsListDataType",
          fields: {
            data: { type: new GraphQLList(this.graphQLType.onePostType) },
            meta: {
              type: new GraphQLNonNull(this.graphQLType.onePaginationMetaType),
            },
          },
        }),
      },
    },
  });

  //get post by id
  getPostById = new GraphQLObjectType({
    name: "getPostByIdType",
    fields: {
      message: { type: this.graphQLType.messageType },
      data: { type: this.graphQLType.onePostType },
    },
  });
}

export const postGraphQLType = new PostGraphQLType();
