import type { HydratedDocument, Types } from "mongoose";
import { ChatTypeEnum } from "../../common/enums/chat.enums.js";
import { MessageTypeEnum } from "../../common/enums/message.enums.js";
import { InternalServerError } from "../../common/errors/server.errors.js";
import { ChatRepository } from "../../infra/repository/messaging/chat.repository.js";
import { MessageRepository } from "../../infra/repository/messaging/message.repository.js";
import type {
  GetChatMessagesDto,
  GetOVOChatDto,
  RestFullAPICreateGroupDto,
  SendOVMMessagesDto,
  SendOVOMessageDto,
} from "./chat.js";
import type { IMessage } from "../../common/interfaces/message.interface.js";
import { notificationService } from "../notification/notification.service.js";
import {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../../common/enums/notification.enums.js";
import {
  ProfileRepository,
  SettingsRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import { JobEnum } from "../../common/enums/job.enums.js";
import type {
  INotification,
  ISendMultipleNotificationsData,
} from "../../common/interfaces/notification.interfaces.js";
import { redisService } from "../../common/services/redis.service.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import type { IChat } from "../../common/interfaces/chat.interface.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { randomUUID } from "node:crypto";
import { s3Service } from "../../common/services/s3.service.js";
import { InvitationRepository } from "../../infra/repository/messaging/invitation.repository.js";
import { InvitationStatusEnum } from "../../common/enums/invitation.enums.js";
import { invitationQueue } from "../../infra/queue/queues/invitation.queue.js";

class ChatService {
  private readonly chatRepository: ChatRepository;
  private readonly messageRepository: MessageRepository;
  private get realtime() {
    return realtimeGateWay;
  }
  private readonly notification = notificationService;
  private readonly profileRepository: ProfileRepository;
  private readonly redis = redisService;
  private readonly s3 = s3Service;
  private readonly userRepository: UserRepository;
  private readonly settingsRepository: SettingsRepository;
  private readonly invitationRepository: InvitationRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
    this.messageRepository = new MessageRepository();
    this.profileRepository = new ProfileRepository();
    this.userRepository = new UserRepository();
    this.settingsRepository = new SettingsRepository();
    this.invitationRepository = new InvitationRepository();
  }

  //send OVO message
  async sendOVOMessage(inputs: SendOVOMessageDto): Promise<IMessage> {
    const { user, content, sendTo } = inputs;
    const profile = await this.profileRepository.findOne({
      filter: { ownerId: user._id },
    });
    let chat = await this.chatRepository.findOne({
      filter: {
        participants: { $all: [user._id, sendTo] },
        type: ChatTypeEnum.OVO,
      },
    });
    if (!chat) {
      chat =
        (await this.chatRepository.createOne({
          data: { participants: [user._id, sendTo], type: ChatTypeEnum.OVO },
        })) || null;
    }
    if (!chat) {
      throw new InternalServerError(`Fail to create chat`);
    }
    const message = await this.messageRepository.createOne({
      data: {
        chatId: chat._id,
        senderId: user._id,
        content,
        type: MessageTypeEnum.TEXT,
      },
    });
    if (!message) {
      throw new InternalServerError(`Fail to send message`);
    }
    chat.lastMessage = message.content as string;
    await Promise.all([
      chat.save(),
      this.redis.incrementMessagesVersion(chat._id),
    ]);
    const socketIds = await this.redis.sMembers(this.redis.socketKey(sendTo));
    const recipientViewingChat = socketIds.some((socketId) => {
      const socket = this.realtime.getIo.sockets.sockets.get(socketId);
      return socket?.data.currentChat?.toString() === chat._id.toString();
    });
    if (recipientViewingChat) {
      return message;
    } else {
      try {
        const notificationDB = await this.notification.createOneNotification({
          recipientId: sendTo,
          actorId: user._id,
          notificationType: NotificationTypeEnum.MESSAGE,
          notificationTargetType: NotificationTargetTypeEnum.MESSAGE,
          notificationTargetId: message._id,
          title: `New Message`,
          body: `${profile?.username} send you message`,
          messageId: message._id,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          pushStatus: PushStatusEnum.PENDING,
        });
        if (notificationDB) {
          const data: ISendMultipleNotificationsData = {
            userIds: [sendTo],
            title: `New Message`,
            body: JSON.stringify({
              message: `${profile?.username} send you message`,
              messageId: message._id,
              chatId: chat._id,
              senderId: user._id,
            }),
            notificationId: notificationDB._id,
          };
          void notificationQueue.add(
            JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
            { ...data },
            { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
          );
        }
      } catch (error) {
        //do nothing
      }

      return message;
    }
  }

  //get OVO chat
  async getChat(inputs: GetOVOChatDto): Promise<IChat> {
    const { user, chatId } = inputs;
    const chat = await this.chatRepository.findOne({
      filter: {
        _id: chatId,
        participants: { $in: [user._id] },
      },
      options: {
        populate: [
          {
            path: "participants",
            populate: [{ path: "profile", select: "username avatarUrl" }],
          },
        ],
      },
    });
    if (!chat) {
      throw new NotFoundError(`Chat not found`);
    }

    return chat;
  }

  //get OVO messages
  async getChatMessages(inputs: GetChatMessagesDto): Promise<Array<IMessage>> {
    const { user, chatId, limit = 30, cursor } = inputs;
    console.log(user);

    const chat = await this.chatRepository.findOne({
      filter: { _id: chatId, participants: { $in: [user._id] } },
    });
    if (!chat) {
      throw new NotFoundError(`Chat not found`);
    }
    const filter: any = { chatId };
    if (cursor) {
      filter._id = { $lt: cursor };
    }
    const version = await this.redis.getMessageVersion(chatId);
    const key = this.redis.messageKey({
      chatId,
      cursor: cursor as Types.ObjectId,
      limit,
      version,
    });
    const messages = await this.redis.cache({
      key,
      ttl: CacheTTL.MESSAGES,
      fn: () =>
        this.messageRepository.find({
          filter,
          options: { sort: "-1", limit: limit + 1 },
        }),
    });
    if (!messages) {
      return [];
    }
    if (messages.length > limit) {
      messages.pop();
    }

    return messages.reverse();
  }

  //create group
  async createGroup(
    inputs: RestFullAPICreateGroupDto,
  ): Promise<HydratedDocument<IChat> | undefined> {
    const { user, participants, groupName, file } = inputs;
    const [users, profile] = await Promise.all([
      //users
      this.userRepository.find({
        filter: { _id: { $in: participants } },
      }),
      //profile
      this.profileRepository.findOne({ filter: { ownerId: user._id } }),
    ]);
    if (!profile) {
      throw new NotFoundError(`Profile not found`);
    }
    if (users.length !== participants.length) {
      throw new BadRequestError("Some participants do not exist");
    }
    const settings = await this.settingsRepository.find({
      filter: { ownerId: { $in: participants } },
    });
    if (settings.length !== participants.length) {
      throw new NotFoundError(`Fail to find settings for some users`);
    }
    let allowedUsers: Array<Types.ObjectId> = [];
    let notAllowedUsers: Array<Types.ObjectId> = [];
    settings.map((setting) => {
      if (setting.allowGroupAdding === true) {
        allowedUsers.push(setting.ownerId);
      } else {
        notAllowedUsers.push(setting.ownerId);
      }
    });
    const roomId = randomUUID();
    let url: string | undefined = undefined;
    if (file) {
      url = await this.s3.uploadAsset({ path: `Chat/${roomId}`, file });
    }
    let group: HydratedDocument<IChat> | undefined = undefined;
    if (allowedUsers.length > 0) {
      group = await this.chatRepository.createOne({
        data: {
          creator: user._id,
          participants: [...allowedUsers, user._id],
          type: ChatTypeEnum.OVM,
          groupName,
          roomId,
          groupImage: url,
        },
      });
      if (!group) {
        throw new BadRequestError(`Fail to create this group`);
      }
      const notificationDB = await this.notification.createOneNotification({
        actorId: user._id,
        notificationType: NotificationTypeEnum.CHAT,
        notificationTargetType: NotificationTargetTypeEnum.CHAT,
        notificationTargetId: group._id,
        title: `New group`,
        body: `${profile.username} add you in ${groupName} group`,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        pushStatus: PushStatusEnum.PENDING,
      });
      const data: ISendMultipleNotificationsData = {
        userIds: allowedUsers,
        title: `New group`,
        body: JSON.stringify({
          message: `${profile.username} add you in ${groupName} group`,
          groupId: group._id,
        }),
        notificationId: notificationDB._id,
      };
      void notificationQueue.add(
        JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
        { ...data },
        { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
      );
    }
    if (notAllowedUsers.length > 0) {
      if (allowedUsers.length <= 0) {
        group = await this.chatRepository.createOne({
          data: {
            creator: user._id,
            participants: [user._id],
            type: ChatTypeEnum.OVM,
            groupName,
            roomId,
            groupImage: url,
          },
        });
      }
      if (!group) {
        throw new BadRequestError(`Fail to create this group`);
      }
      const invitations = notAllowedUsers.length
        ? await this.invitationRepository.insertMany({
            docs: notAllowedUsers.map((receiverId) => ({
              chatId: group?._id,
              senderId: user._id,
              receiverId,
              status: InvitationStatusEnum.PENDING,
            })),
          })
        : [];
      if (invitations.length) {
        await invitationQueue.add(
          JobEnum.CREATE_INVITATION_MESSAGES,
          {
            invitations: invitations.map((invitation) => ({
              invitationId: invitation._id,
              senderId: invitation.senderId,
              receiverId: invitation.receiverId,
            })),
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 3000,
            },
          },
        );
      }
      const notificationDB = await this.notification.createOneNotification({
        actorId: user._id,
        notificationType: NotificationTypeEnum.CHAT,
        notificationTargetType: NotificationTargetTypeEnum.CHAT,
        notificationTargetId: group._id,
        title: `New invitation`,
        body: `${profile.username} invite you to join ${groupName} group`,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        pushStatus: PushStatusEnum.PENDING,
      });
      const data: ISendMultipleNotificationsData = {
        userIds: notAllowedUsers,
        title: `New group`,
        body: JSON.stringify({
          message: `${profile.username} invite you to join ${groupName} group`,
          groupId: group._id,
        }),
        notificationId: notificationDB._id,
      };
      void notificationQueue.add(
        JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
        { ...data },
        { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
      );
    }

    return group;
  }

  //send OVM messages
  async sendOVMMessage(
    inputs: SendOVMMessagesDto,
  ): Promise<{ roomId: string; message: HydratedDocument<IMessage> }> {
    const { user, chatId, content } = inputs;
    const [profile, chat] = await Promise.all([
      this.profileRepository.findOne({ filter: { ownerId: user._id } }),
      this.chatRepository.findOne({
        filter: {
          _id: chatId,
          participants: { $in: [user._id] },
          type: ChatTypeEnum.OVM,
        },
      }),
    ]);
    if (!chat) {
      throw new NotFoundError(
        "Group chat not found or you are not participant in this group",
      );
    }
    const message = await this.messageRepository.createOne({
      data: {
        chatId: chat._id,
        senderId: user._id,
        content,
        type: MessageTypeEnum.TEXT,
      },
    });
    if (!message) {
      throw new InternalServerError("Fail to send message");
    }
    chat.lastMessage = content;
    await Promise.all([
      chat.save(),
      this.redis.incrementMessagesVersion(chat._id),
    ]);
    const otherParticipants = chat.participants.filter(
      (p) => p.toString() !== user._id.toString(),
    );
    await Promise.all(
      otherParticipants.map(async (participantId) => {
        const socketIds = await this.redis.sMembers(
          this.redis.socketKey(participantId),
        );
        const isViewingChat = socketIds.some((socketId) => {
          const socket = this.realtime.getIo.sockets.sockets.get(socketId);
          return socket?.data.currentChat?.toString() === chat._id.toString();
        });
        if (isViewingChat) return;
        try {
          const notificationDB = await this.notification.createOneNotification({
            recipientId: participantId,
            actorId: user._id,
            notificationType: NotificationTypeEnum.MESSAGE,
            notificationTargetType: NotificationTargetTypeEnum.MESSAGE,
            notificationTargetId: message._id,
            title: "New Message",
            body: `${profile?.username} sent a message in ${chat.groupName}`,
            messageId: message._id,
            username: profile?.username,
            avatarUrl: profile?.avatarUrl,
            pushStatus: PushStatusEnum.PENDING,
          });
          if (notificationDB) {
            void notificationQueue.add(
              JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
              {
                userIds: [participantId],
                title: "New Message",
                body: JSON.stringify({
                  message: `${profile?.username} sent a message`,
                  messageId: message._id,
                  chatId: chat._id,
                  senderId: user._id,
                  notificationId: notificationDB._id,
                }),
                notificationId: notificationDB._id,
              },
              { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
            );
          }
        } catch {
          // don't fail message send if notification fails
        }
      }),
    );

    return { roomId: chat.roomId as string, message };
  }
}

export const chatService = new ChatService();
