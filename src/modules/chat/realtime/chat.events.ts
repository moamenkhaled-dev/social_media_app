import type { IAuthSocket } from "../../../common/types/socket.js";
import type {
  SocketSendOVMMessagesDto,
  SocketSendOVOMessageDto,
} from "../chat.js";
import { socketValidate } from "../../../middlewares/validation.middleware.js";
import { chatValidation } from "../chat.validation.js";
import { chatService } from "../chat.service.js";
import { redisService } from "../../../common/services/redis.service.js";
import type { Server } from "socket.io";

class ChatEvent {
  private readonly chatValidation = chatValidation;
  private get chatService() {
    return chatService;
  }

  private readonly redis = redisService;

  //join chat
  joinChat = (socket: IAuthSocket) => {
    return socket.on("join_chat", async ({ chatId }: { chatId: string }) => {
      try {
        socket.join(chatId);
        socket.data.currentChat = chatId;
      } catch (error) {
        socket.emit("custom_error", error);
      }
    });
  };

  //leave chat
  leaveChat = (socket: IAuthSocket) => {
    return socket.on("leave_chat", async ({ chatId }: { chatId: string }) => {
      try {
        socket.leave(chatId);
        if (socket.data.currentChat?.toString() === chatId.toString()) {
          socket.data.currentChat = null;
        }
      } catch (error) {
        socket.emit("custom_error", error);
      }
    });
  };

  //send OVO message
  sendOVOMessage = (socket: IAuthSocket) => {
    return socket.on(
      "sendOVOMessage",
      async (inputs: SocketSendOVOMessageDto) => {
        try {
          const { sendTo, content } = inputs;
          //validation
          await socketValidate<SocketSendOVOMessageDto>({
            schema: this.chatValidation.sendOVOMessage,
            args: { sendTo, content },
          });
          //service
          const message = await this.chatService.sendOVOMessage({
            content,
            sendTo,
            user: socket.data.user,
          });
          //events
          socket.emit("successMessage", { content });
          socket
            .to(await this.redis.sMembers(this.redis.socketKey(sendTo)))
            .emit("newMessage", message);
        } catch (error) {
          socket.emit("custom_error", error);
        }
      },
    );
  };

  //join room
  join_room = (socket: IAuthSocket) => {
    return socket.on("join_room", async ({ roomId }: { roomId: string }) => {
      try {
        socket.join(roomId);
      } catch (error) {
        socket.emit("custom_error", error);
      }
    });
  };

  //send OVM messages
  sendOVMMessages = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "sendOVMMessages",
      async (inputs: SocketSendOVMMessagesDto) => {
        try {
          const { chatId, content } = inputs;
          //validation
          await socketValidate<SocketSendOVMMessagesDto>({
            schema: this.chatValidation.sendOVMMessages,
            args: { chatId, content },
          });
          //service
          const { roomId, message } = await this.chatService.sendOVMMessage({
            user: socket.data.user,
            chatId,
            content,
          });

          io.to(
            await this.redis.sMembers(
              this.redis.socketKey(socket.data.user._id),
            ),
          ).emit("successMessage", { message, sendTo: chatId });
          socket.to(roomId as string).emit("newMessage", { message, chatId });
        } catch (error) {
          socket.emit("custom_error");
        }
      },
    );
  };
}

export const chatEvent = new ChatEvent();
