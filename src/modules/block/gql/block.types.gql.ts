import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class BlockGraphQLType {
  private readonly graphQLType = graphQLTypes;

  //block
  block = new GraphQLObjectType({
    name: `blockType`,
    fields: {
      message: { type: this.graphQLType.messageType },
    },
  });

  //block list
  blockList = new GraphQLObjectType({
    name: `blockListType`,
    fields: {
      message: { type: this.graphQLType.messageType },
      data: {
        type: new GraphQLList(
          new GraphQLObjectType({
            name: "blockListDataType",
            fields: {
              blockedId: { type: new GraphQLNonNull(GraphQLID) },
              blocked: {
                type: new GraphQLObjectType({
                  name: "blockedType",
                  fields: {
                    username: { type: GraphQLString },
                    avatarUrl: { type: GraphQLString },
                  },
                }),
              },
            },
          }),
        ),
      },
    },
  });
}

export const blockGraphQLType = new BlockGraphQLType();
