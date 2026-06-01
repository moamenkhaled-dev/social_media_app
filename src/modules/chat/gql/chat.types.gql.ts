import { GraphQLList, GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class GraphQLChatType {
  private readonly graphQlTypes = graphQLTypes;

  //get OVO chat
  getOVOChat = new GraphQLObjectType({
    name: "getOVOChatType",
    fields: {
      message: { type: this.graphQlTypes.messageType },
      data: { type: this.graphQlTypes.oneChatType },
    },
  });

  //get OVO messages
  getOVOMessages = new GraphQLObjectType({
    name: "getOVOMessagesType",
    fields: {
      message: { type: this.graphQlTypes.messageType },
      data: { type: new GraphQLList(this.graphQlTypes.oneMessageType) },
    },
  });
}

export const graphQLChatType = new GraphQLChatType();
