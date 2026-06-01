import type { Server } from "socket.io";
import type { IAuthSocket } from "../../../common/types/socket.js";
import { chatEvent } from "./chat.events.js";

class ChatGateWay {
  private readonly chatEvent = chatEvent;

  registerEvents(socket: IAuthSocket, io: Server) {
    this.chatEvent.joinChat(socket);
    this.chatEvent.leaveChat(socket);
    this.chatEvent.sendOVOMessage(socket);
    this.chatEvent.join_room(socket);
    this.chatEvent.sendOVMMessages(socket, io);
  }
}

export const chatGateWay = new ChatGateWay();
