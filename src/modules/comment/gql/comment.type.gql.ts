import { GraphQLList, GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class GraphQLCommentType {
  private readonly graphQLTypes = graphQLTypes;

  //get comment
  getComment = new GraphQLObjectType({
    name: `getCommentType`,
    fields: {
      message: { type: this.graphQLTypes.messageType },
      data: { type: this.graphQLTypes.oneCommentType },
    },
  });

  //comments list
  commentsList = new GraphQLObjectType({
    name: `commentsList`,
    fields: {
      message: { type: this.graphQLTypes.messageType },
      data: {
        type: new GraphQLObjectType({
          name: `commentsListType`,
          fields: {
            data: { type: new GraphQLList(this.graphQLTypes.oneCommentType) },
            meta: { type: this.graphQLTypes.onePaginationMetaType },
          },
        }),
      },
    },
  });
}

export const graphQLCommentType = new GraphQLCommentType();
