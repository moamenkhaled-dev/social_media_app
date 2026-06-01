import type { Types } from "mongoose";
import { ChatRepository } from "../../repository/messaging/chat.repository.js";
import { ChatTypeEnum } from "../../../common/enums/chat.enums.js";
import { MessageRepository } from "../../repository/messaging/message.repository.js";
import { realtimeGateWay } from "../../../modules/realtime/realtime.gateway.js";
import { MessageTypeEnum } from "../../../common/enums/message.enums.js";
import { redisService } from "../../../common/services/redis.service.js";

class InvitationProcess {
  private readonly chatRepository: ChatRepository;
  private readonly messageRepository: MessageRepository;
  private readonly redis = redisService;

  // ✅ lazy getter — avoids circular import issue
  private get realtime() {
    return realtimeGateWay;
  }

  constructor() {
    this.chatRepository = new ChatRepository();
    this.messageRepository = new MessageRepository();
  }

  async sendInvitationMessages(
    invitations: Array<{
      invitationId: Types.ObjectId;
      senderId: Types.ObjectId;
      receiverId: Types.ObjectId;
    }>,
  ) {
    await Promise.all(
      invitations.map(async (invitation) => {
        try {
          let ovoChat = await this.chatRepository.findOne({
            filter: {
              type: ChatTypeEnum.OVO,
              participants: {
                $all: [invitation.senderId, invitation.receiverId],
                $size: 2,
              },
            },
          });
          if (!ovoChat) {
            ovoChat =
              (await this.chatRepository.createOne({
                data: {
                  type: ChatTypeEnum.OVO,
                  participants: [invitation.senderId, invitation.receiverId],
                },
              })) ?? null;
          }
          if (!ovoChat) {
            console.error(
              `Failed to find or create chat for invitation ${invitation.invitationId}`,
            );
            return;
          }
          const message = await this.messageRepository.createOne({
            data: {
              chatId: ovoChat._id,
              senderId: invitation.senderId,
              type: MessageTypeEnum.INVITATION,
              invitationId: invitation.invitationId,
            },
          });
          if (!message) {
            console.error(
              `Failed to create message for invitation ${invitation.invitationId}`,
            );
            return;
          }
          const socketIds = await this.redis.sMembers(
            this.redis.socketKey(invitation.receiverId),
          );
          if (socketIds.length) {
            this.realtime.getIo.to(socketIds).emit("newMessage", message);
          }
        } catch (error) {
          console.error(
            `Error processing invitation ${invitation.invitationId}:`,
            error,
          );
        }
      }),
    );
  }
}

export const invitationProcess = new InvitationProcess();
