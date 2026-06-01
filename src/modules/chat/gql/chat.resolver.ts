import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type {
  GraphQLGetChatMessagesDto,
  GraphQLGetOVOChatDto,
} from "../chat.js";
import { chatService } from "../chat.service.js";
import { chatValidation } from "../chat.validation.js";

class GraphQLChatResolver {
  private readonly chatValidation = chatValidation;
  private readonly chatService = chatService;

  //get OVO chat
  getOVOChat = async (
    parent: any,
    { chatId }: GraphQLGetOVOChatDto,
    context: IGQqlContext,
  ) => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLGetOVOChatDto>({
      schema: this.chatValidation.getOVOChat,
      args: { chatId },
    });
    //service
    const chat = await this.chatService.getChat({ user, chatId });

    return { message: "Success", data: chat };
  };

  //get OVO messages
  getOVOMessages = async (
    parent: any,
    { chatId, cursor }: GraphQLGetChatMessagesDto,
    context: IGQqlContext,
  ) => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLGetChatMessagesDto>({
      schema: chatValidation.getOVOMessages,
      args: { chatId, cursor },
    });
    //service
    const messages = await this.chatService.getChatMessages({
      user,
      chatId,
      cursor,
    });

    return { message: "Success", data: messages };
  };
}

export const graphQLChatResolver = new GraphQLChatResolver();
