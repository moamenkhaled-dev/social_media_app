import { graphQLChatArgs } from "./chat.args.gql.js";
import { graphQLChatResolver } from "./chat.resolver.js";
import { graphQLChatType } from "./chat.types.gql.js";

class ChatGraphQLSchema {
  private readonly chatType = graphQLChatType;
  private readonly chatArgs = graphQLChatArgs;
  private readonly chatResolver = graphQLChatResolver;

  //query
  registerQuery() {
    return {
      //get OVO chat
      getOVOChat: {
        description: "get OVO Chat",
        type: this.chatType.getOVOChat,
        args: this.chatArgs.getOVOChat,
        resolve: this.chatResolver.getOVOChat,
      },

      //get OVO messages
      getOVOMessages: {
        description: "get OVO messages",
        type: this.chatType.getOVOMessages,
        args: this.chatArgs.getOVOMessages,
        resolve: this.chatResolver.getOVOMessages,
      },
    };
  }
}

export const chatGraphQLSchema = new ChatGraphQLSchema();
