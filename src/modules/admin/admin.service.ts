import { startSession, type PipelineStage } from "mongoose";
import { JobEnum } from "../../common/enums/job.enums.js";
import { RoleEnum } from "../../common/enums/user.enums.js";
import {
  ConflictError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { emailQueue } from "../../infra/queue/queues/email.queue.js";
import {
  BlockRepository,
  FollowRepository,
  PostRepository,
  ProfileRepository,
  SettingsRepository,
  StatsRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import type {
  AdminDeleteUserDto,
  BanDto,
  BannedUsersListDto,
  UnBanDto,
} from "./admin.js";
import type { IBannedUsersListResponse } from "./admin.entity.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { ChatRepository } from "../../infra/repository/messaging/chat.repository.js";
import { MessageRepository } from "../../infra/repository/messaging/message.repository.js";
import { StoryRepository } from "../../infra/repository/engagement/story.repository.js";

class AdminService {
  private readonly userRepository: UserRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly settingsRepository: SettingsRepository;
  private readonly statsRepository: StatsRepository;
  private readonly postRepository: PostRepository;
  private readonly chatRepository: ChatRepository;
  private readonly messageRepository: MessageRepository;
  private readonly storyRepository: StoryRepository;
  private readonly followRepository: FollowRepository;
  private readonly blockRepository: BlockRepository;
  private readonly redis = redisService;

  constructor() {
    this.userRepository = new UserRepository();
    this.profileRepository = new ProfileRepository();
    this.settingsRepository = new SettingsRepository();
    this.statsRepository = new StatsRepository();
    this.postRepository = new PostRepository();
    this.chatRepository = new ChatRepository();
    this.messageRepository = new MessageRepository();
    this.storyRepository = new StoryRepository();
    this.followRepository = new FollowRepository();
    this.blockRepository = new BlockRepository();
  }

  //ban user
  async banUser(inputs: BanDto): Promise<void> {
    const { user, targetUserId, banReason } = inputs;
    if (user._id.equals(targetUserId)) {
      throw new ConflictError(`You can't ban yourself`);
    }
    const targetUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: targetUserId, role: RoleEnum.USER },
      update: {
        $set: {
          bannedAt: new Date(),
          banReason: banReason,
          adminBanner: user._id,
        },
      },
    });
    if (!targetUser) {
      throw new NotFoundError(`User not found`);
    }
    await emailQueue.add(
      JobEnum.SEND_EMAIL,
      {
        to: targetUser.email,
        subject: `Ban notify`,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    await this.redis.incrementUserVersion(targetUserId);

    return;
  }

  //un ban
  async unBan(inputs: UnBanDto): Promise<void> {
    const { targetUserId } = inputs;
    const targetUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: targetUserId, onlyBanned: true },
      update: {
        $set: { banCancelledAt: new Date() },
        $unset: { bannedAt: 1, banReason: 1, adminBanner: 1 },
      },
    });
    if (!targetUser) {
      throw new NotFoundError(`User not found`);
    }
    await emailQueue.add(
      JobEnum.SEND_EMAIL,
      { to: targetUser.email, subject: `You are un ban notify` },
      { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
    );

    return;
  }

  //banned users
  private async bannedUsers({
    page,
    limit,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Array<IBannedUsersListResponse>> {
    const pipeline: Array<PipelineStage> = [
      { $match: { bannedAt: { $ne: null } } },
    ];
    if (search?.trim()) {
      pipeline.push(
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "ownerId",
            pipeline: [
              {
                $project: {
                  username: 1,
                  avatarUrl: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $unwind: "$user" },
        { $match: { "user.username": { $regex: search, $options: "i" } } },
        { $sort: { bannedAt: -1 } },
        { $skip: ((page as number) - 1) * (limit as number) },
        { $limit: limit as number },
      );
    } else {
      pipeline.push(
        { $sort: { bannedAt: -1 } },
        { $skip: ((page as number) - 1) * (limit as number) },
        { $limit: limit as number },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "ownerId",
            pipeline: [
              {
                $project: {
                  username: 1,
                  avatarUrl: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $unwind: "$user" },
      );
    }
    const version = await this.redis.getBannedUsersListVersion();
    const key = this.redis.bannedUsersList({
      page: page as number,
      limit: limit as number,
      search: search as string,
      version,
    });
    const users = await this.redis.cache({
      key,
      ttl: CacheTTL.BANNED_USERS_LIST,
      fn: () =>
        this.userRepository.aggregate<IBannedUsersListResponse>({
          pipeline,
        }),
    });
    if (!users?.length) {
      return [];
    }

    return users;
  }

  //banned users list
  async bannedUsersList(
    inputs: BannedUsersListDto,
  ): Promise<Array<IBannedUsersListResponse>> {
    const { page, limit, search } = inputs;
    const users = await this.bannedUsers({
      page: page as number,
      limit: limit as number,
      search: search as string,
    });

    return users;
  }

  //admin delete user
  async adminDeleteUser(inputs: AdminDeleteUserDto): Promise<void> {
    const { targetUserId } = inputs;
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        //delete user
        const deletedUser = await this.userRepository.findOneAndDelete({
          filter: { _id: targetUserId, paranoid: false },
          options: { session },
        });
        if (!deletedUser) {
          throw new Error("User not found or already deleted");
        }
        //delete profile
        const profileResult = await this.profileRepository.deleteOne({
          filter: { ownerId: targetUserId },
          options: { session },
        });
        if (profileResult.deletedCount !== 1) {
          throw new Error("Profile not deleted");
        }
        //delete settings
        const settingsResult = await this.settingsRepository.deleteOne({
          filter: { ownerId: targetUserId },
          options: { session },
        });
        if (settingsResult.deletedCount !== 1) {
          throw new Error("Settings not deleted");
        }
        //delete stats
        const statsResult = await this.statsRepository.deleteOne({
          filter: { ownerId: targetUserId },
          options: { session },
        });
        if (statsResult.deletedCount !== 1) {
          throw new Error("Stats not deleted");
        }
        //delete posts
        await this.postRepository.deleteMany({
          filter: { authorId: targetUserId },
          options: { session },
        });
        //delete chats
        await this.chatRepository.deleteMany({
          filter: { participants: { $in: [targetUserId] } },
          options: { session },
        });
        //delete messages
        await this.messageRepository.deleteMany({
          filter: { senderId: targetUserId },
          options: { session },
        });
        //delete stories
        await this.storyRepository.deleteMany({
          filter: { ownerId: targetUserId },
          options: { session },
        });
        //delete follow
        await this.followRepository.deleteMany({
          filter: {
            $or: [{ followerId: targetUserId }, { followingId: targetUserId }],
          },
          options: { session },
        });
        //delete block
        await this.blockRepository.deleteMany({
          filter: {
            $or: [{ blockerId: targetUserId }, { blockedId: targetUserId }],
          },
          options: { session },
        });
      });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
    await Promise.all([
      this.redis.incrementUserVersion(targetUserId),
      this.redis.incrementProfileVersion(targetUserId),
      this.redis.incrementSettingsVersion(targetUserId),
      this.redis.incrementStatsVersion(targetUserId),
      this.redis.incrementPostVersion({
        userId: targetUserId,
      }),
      this.redis.incrementStoryListVersion(targetUserId),
      this.redis.incrementFollowersVersion(targetUserId),
      this.redis.incrementFollowingVersion(targetUserId),
      this.redis.incrementFollowRequestsVersion(targetUserId),
      this.redis.incrementBlockListVersion(targetUserId),
    ]);

    return;
  }
}

export const adminService = new AdminService();
