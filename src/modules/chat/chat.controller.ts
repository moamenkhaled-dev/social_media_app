import type { Request, Response } from "express";
import { chatService } from "./chat.service.js";
import { successResponse } from "../../common/responses/success.response.js";

class ChatController {
  private get chat() {
    return chatService;
  }

  //create group
  createGroup = async (req: Request, res: Response) => {
    const group = await this.chat.createGroup({ user: req.user, ...req.body });

    return successResponse({ res, status: 201, data: group });
  };
}

export const chatController = new ChatController();
