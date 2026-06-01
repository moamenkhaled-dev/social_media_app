import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";

class GraphQLChatArgs {
  //get OVO chat
  getOVOChat = { chatId: { type: new GraphQLNonNull(GraphQLString) } };

  //get OVO Messages
  getOVOMessages = {
    chatId: { type: new GraphQLNonNull(GraphQLString) },
    cursor: { type: GraphQLID },
  };
}

export const graphQLChatArgs = new GraphQLChatArgs();
