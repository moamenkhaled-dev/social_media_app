import {
  startSession,
  Types,
  type HydratedDocument,
  type PipelineStage,
} from "mongoose";
import { FollowStatusEnum } from "../../common/enums/follow.enums.js";
import { JobEnum } from "../../common/enums/job.enums.js";
import {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../../common/enums/notification.enums.js";
import { ProfileVisibilityEnum } from "../../common/enums/profile.enums.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import { InternalServerError } from "../../common/errors/server.errors.js";
import type { ISendMultipleNotificationsData } from "../../common/interfaces/notification.interfaces.js";
import { redisService } from "../../common/services/redis.service.js";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import {
  BlockRepository,
  FollowRepository,
  NotificationRepository,
  ProfileRepository,
  SettingsRepository,
  StatsRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import type { IFollow } from "../../common/interfaces/follow.interface.js";
import type { FollowersListDto, FollowUserDto } from "./follow.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { ShowFollowEnum } from "../../common/enums/settings.enums.js";
import type { IFollowersListResponse } from "./follow.entity.js";

class FollowService {
  private readonly userRepository: UserRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly statsRepository: StatsRepository;
  private readonly followRepository: FollowRepository;
  private readonly blockRepository: BlockRepository;
  private readonly settingsRepository: SettingsRepository;
  private readonly redis = redisService;
  private readonly notification: NotificationRepository;
  private get realtime() {
    return realtimeGateWay;
  }

  constructor() {
    this.userRepository = new UserRepository();
    this.profileRepository = new ProfileRepository();
    this.statsRepository = new StatsRepository();
    this.followRepository = new FollowRepository();
    this.blockRepository = new BlockRepository();
    this.settingsRepository = new SettingsRepository();
    this.notification = new NotificationRepository();
  }

  //follow user
  async follow(inputs: FollowUserDto): Promise<{ status: FollowStatusEnum }> {
    const { user, targetUserId } = inputs;
    if (user._id.equals(targetUserId)) {
      throw new BadRequestError(`You can't follow your self`);
    }
    const [targetUser, isBlock, targetProfile, userProfile, settings] =
      await Promise.all([
        //targetUser
        this.userRepository.findOne({
          filter: { _id: targetUserId },
        }),
        //isBlock
        this.blockRepository.findOne({
          filter: {
            $or: [
              { blockerId: user._id, blockedId: targetUserId },
              { blockerId: targetUserId, blockedId: user._id },
            ],
          },
        }),
        //targetProfile
        this.profileRepository.findOne({
          filter: { ownerId: targetUserId },
        }),
        //userProfile
        this.profileRepository.findOne({
          filter: { ownerId: user._id },
        }),
        //settings
        this.settingsRepository.findOne({
          filter: { ownerId: targetUserId },
        }),
      ]);
    if (!targetUser) {
      throw new NotFoundError(`User not found`);
    }
    if (isBlock) {
      throw new ForbiddenError(`User not found`);
    }
    if (!targetProfile) {
      throw new NotFoundError(`Target profile not found`);
    }
    if (!userProfile) {
      throw new NotFoundError(`Your profile not found`);
    }
    if (!settings) {
      throw new NotFoundError(`Settings not found`);
    }
    const isPrivate =
      targetProfile.visibility === ProfileVisibilityEnum.PRIVATE;
    const session = await startSession();
    session.startTransaction();
    let follow: HydratedDocument<IFollow> | undefined = undefined;
    try {
      follow = await this.followRepository.createOne({
        data: {
          followerId: user._id,
          followingId: targetUserId,
          followStatus: isPrivate
            ? FollowStatusEnum.REQUESTED
            : FollowStatusEnum.ACCEPTED,
        },
        options: { session },
      });
      if (!isPrivate) {
        await this.statsRepository.findOneAndUpdate({
          filter: { ownerId: targetUserId },
          update: { $inc: { followersCount: 1 } },
          options: { session },
        });
        await this.statsRepository.findOneAndUpdate({
          filter: { ownerId: user._id },
          update: { $inc: { followingCount: 1 } },
          options: { session },
        });
      }
      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      if (error?.code === 11000) {
        throw new ConflictError(
          "You already follow or requested to follow this user",
        );
      }
      throw error;
    } finally {
      await session.endSession();
    }
    if (!follow) {
      throw new InternalServerError(
        `Fail to follow this user please try again later`,
      );
    }
    const socketIds = await this.redis.getSockets(user._id);
    isPrivate
      ? this.realtime.getIo
          .to(socketIds)
          .emit("request_follow_user", { actorId: user._id, targetUserId })
      : this.realtime.getIo
          .to(socketIds)
          .emit("follow_user", { actorId: user._id, targetUserId });
    await Promise.all([
      this.redis.incrementFollowingVersion(user._id),
      this.redis.incrementFollowersVersion(targetUserId),
    ]);
    if (settings.allowNotifications) {
      try {
        const notificationDB = await this.notification.createOne({
          data: {
            actorId: user._id,
            recipientId: targetUserId,
            notificationType: NotificationTypeEnum.FOLLOW,
            notificationTargetType: NotificationTargetTypeEnum.USER,
            notificationTargetId: targetUserId,
            title: `New Follow`,
            body: isPrivate
              ? `${userProfile.username} send you follow request`
              : `${userProfile.username} follow you`,
            data: {
              username: `${userProfile.username}`,
              avatarUrl: `${userProfile.avatarUrl}`,
            },
            pushStatus: PushStatusEnum.PENDING,
          },
        });
        if (notificationDB) {
          const data: ISendMultipleNotificationsData = {
            userIds: [targetUser._id],
            title: `New follow`,
            body: JSON.stringify({
              message: isPrivate
                ? `${userProfile.username} send you follow request`
                : `${userProfile.username} follow you`,
              followerId: user._id,
              followingId: targetUserId,
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
        //TODO : logger here
      }
    }

    return { status: follow?.followStatus as FollowStatusEnum };
  }

  //un follow
  async unFollow(inputs: FollowUserDto): Promise<void> {
    const { user, targetUserId } = inputs;
    if (user._id.equals(targetUserId)) {
      throw new BadRequestError(`You can't unFollow yourself`);
    }
    const [targetUser, isFollower] = await Promise.all([
      //targetUser
      this.userRepository.findOne({
        filter: { _id: targetUserId },
      }),
      //isFollower
      this.followRepository.findOne({
        filter: { followerId: user._id, followingId: targetUserId },
      }),
    ]);
    if (!targetUser) {
      throw new NotFoundError(`User not found`);
    }
    if (!isFollower) {
      throw new ConflictError(`You already not following him`);
    }
    const session = await startSession();
    session.startTransaction();
    try {
      await this.followRepository.findOneAndDelete({
        filter: { followerId: user._id, followingId: targetUserId },
        options: { session },
      });
      await this.statsRepository.findOneAndUpdate({
        filter: { ownerId: user._id },
        update: { $inc: { followingCount: -1 } },
        options: { session },
      });
      await this.statsRepository.findOneAndUpdate({
        filter: { ownerId: targetUserId },
        update: { $inc: { followersCount: -1 } },
        options: { session },
      });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
    this.realtime.getIo
      .to(await this.redis.getSockets(user._id))
      .emit("unFollow_user", { actorId: user._id, targetUserId });
    await Promise.all([
      this.redis.incrementFollowingVersion(user._id),
      this.redis.incrementFollowersVersion(targetUserId),
    ]);

    return;
  }

  //cancel follow request
  async rejectFollowRequest(inputs: FollowUserDto): Promise<void> {
    const { user, targetUserId } = inputs;
    const [profile, settings] = await Promise.all([
      //profile
      this.profileRepository.findOne({ filter: { ownerId: user._id } }),
      //settings
      this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
    ]);
    if (!profile) {
      throw new NotFoundError(`Profile not found`);
    }
    if (!settings) {
      throw new NotFoundError(`settings not found`);
    }
    const follow = await this.followRepository.findOneAndDelete({
      filter: {
        followingId: user._id,
        followerId: targetUserId,
        requested: true,
      },
    });
    if (!follow) {
      throw new NotFoundError(`Follow request not found`);
    }
    this.realtime.getIo
      .to(await this.redis.getSockets(user._id))
      .emit("reject_follow_request", {
        rejecter: user._id,
        targetUserId,
        followRequestId: follow._id,
      });
    if (settings.allowNotifications === true) {
      try {
        const notificationDB = await this.notification.createOne({
          data: {
            actorId: user._id,
            recipientId: targetUserId,
            notificationType: NotificationTypeEnum.FOLLOW,
            notificationTargetType: NotificationTargetTypeEnum.USER,
            notificationTargetId: targetUserId,
            title: `New notification`,
            body: `${profile.username} reject your follow request`,
            data: {
              username: `${profile.username}`,
              avatarUrl: `${profile.avatarUrl}`,
            },
            pushStatus: PushStatusEnum.PENDING,
          },
        });
        if (notificationDB) {
          const data: ISendMultipleNotificationsData = {
            userIds: [targetUserId],
            title: `New notification`,
            body: JSON.stringify({
              message: `${profile.username} reject you follow request`,
              followerId: targetUserId,
              followingId: user._id,
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
        //TODO : logger here
      }
    }

    return;
  }

  //accept follow request
  async acceptFollowRequest(inputs: FollowUserDto): Promise<void> {
    const { user, targetUserId } = inputs;
    const [userProfile, targetSettings] = await Promise.all([
      //userProfile
      this.profileRepository.findOne({ filter: { ownerId: user._id } }),
      //target settings
      this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
    ]);
    if (!userProfile) {
      throw new NotFoundError(`profile not found`);
    }
    if (!targetSettings) {
      throw new NotFoundError(
        `Something went wrong may be target user not found`,
      );
    }
    const session = await startSession();
    session.startTransaction();
    let follow: HydratedDocument<IFollow> | null = null;
    try {
      follow = await this.followRepository.findOneAndUpdate({
        filter: {
          followingId: user._id,
          followerId: targetUserId,
          requested: true,
        },
        update: { followStatus: FollowStatusEnum.ACCEPTED },
        options: { session },
      });
      //user stats
      await this.statsRepository.findOneAndUpdate({
        filter: { ownerId: user._id },
        update: { $inc: { followersCount: 1 } },
        options: { session },
      });
      //target stats
      await this.statsRepository.findOneAndUpdate({
        filter: { ownerId: targetUserId },
        update: { $inc: { followingCount: 1 } },
        options: { session },
      });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
    this.realtime.getIo
      .to(await this.redis.getSockets(targetUserId))
      .emit("accept_follow_request", {
        followerId: targetUserId,
        followingId: user._id,
        followId: follow?._id,
      });
    await Promise.all([
      this.redis.incrementFollowingVersion(targetUserId),
      this.redis.incrementFollowersVersion(user._id),
    ]);
    if (targetSettings.allowNotifications === true) {
      try {
        const notificationDB = await this.notification.createOne({
          data: {
            actorId: user._id,
            recipientId: targetUserId,
            notificationType: NotificationTypeEnum.FOLLOW,
            notificationTargetType: NotificationTargetTypeEnum.USER,
            notificationTargetId: targetUserId,
            title: `New notification`,
            body: `${userProfile.username} accept your follow request`,
            data: {
              username: `${userProfile.username}`,
              avatarUrl: `${userProfile.avatarUrl}`,
            },
            pushStatus: PushStatusEnum.PENDING,
          },
        });
        if (notificationDB) {
          const data: ISendMultipleNotificationsData = {
            userIds: [targetUserId],
            title: `New notification`,
            body: JSON.stringify({
              message: `${userProfile.username} accept you follow request`,
              followerId: targetUserId,
              followingId: user._id,
            }),
            notificationId: notificationDB._id,
          };
          void notificationQueue.add(
            JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
            { ...data },
            { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
          );
        }

        return;
      } catch (error) {
        //TODO : logger here
      }

      return;
    }
  }

  private readonly followers = async ({
    userId,
    page,
    limit,
    search,
  }: {
    userId: Types.ObjectId | string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Array<IFollowersListResponse>> => {
    const pipeline: Array<PipelineStage> = [
      { $match: { followingId: userId } },
      {
        $lookup: {
          from: "profiles",
          localField: "followerId",
          foreignField: "ownerId",
          as: "follower",
        },
      },
      { $unwind: "$follower" },
    ];
    if (search?.trim()) {
      pipeline.push({
        $match: { "follower.username": { $regex: search, $options: "i" } },
      });
    }
    pipeline.push(
      { $skip: ((page as number) - 1) * (limit as number) },
      { $limit: limit as number },
    );
    const version = await this.redis.getFollowersVersion(userId);
    const key = this.redis.followersKey({
      userId: userId,
      page,
      limit,
      search,
      version,
    });
    const followers = await this.redis.cache({
      key,
      ttl: CacheTTL.FOLLOWERS_LIST,
      fn: () =>
        this.followRepository.aggregate<IFollowersListResponse>({
          pipeline,
        }),
    });
    if (!followers?.length) {
      return [];
    }

    return followers;
  };

  //followers list
  async followersList(
    inputs: FollowersListDto,
  ): Promise<Array<IFollowersListResponse>> {
    const { user, targetUserId, page, limit, search } = inputs;
    const isOwner = user._id.equals(targetUserId);
    if (isOwner) {
      const followers = await this.followers({
        userId: targetUserId,
        page: page as number,
        limit: limit as number,
        search: search as string,
      });

      return followers;
    }
    const [targetUser, targetProfile, isBlock, targetSettings, isFollower] =
      await Promise.all([
        //targetUser
        this.userRepository.findOne({ filter: { _id: targetUserId } }),
        //profile
        this.profileRepository.findOne({
          filter: { ownerId: targetUserId },
        }),
        //isBlock
        this.blockRepository.findOne({
          filter: {
            $or: [
              { blockerId: user._id, blockedId: targetUserId },
              { blockerId: targetUserId, blockedId: user._id },
            ],
          },
        }),
        //settings
        this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
        //isFollower
        this.followRepository.findOne({
          filter: { followerId: user._id, followingId: targetUserId },
        }),
      ]);
    if (!targetUser || isBlock) {
      throw new NotFoundError(`User not found`);
    }
    if (!targetProfile || !targetSettings) {
      throw new NotFoundError(
        `Something went wrong profile or settings not found please try again later`,
      );
    }
    if (isFollower) {
      if (targetSettings.privacy.showFollowersList !== ShowFollowEnum.ONLY_ME) {
        const followers = await this.followers({
          userId: targetUserId,
          page: page as number,
          limit: limit as number,
          search: search as string,
        });

        return followers;
      }
    }
    if (
      targetProfile.visibility === ProfileVisibilityEnum.PRIVATE ||
      targetSettings.privacy.showFollowersList !== ShowFollowEnum.ANYONE
    ) {
      throw new ForbiddenError(`You can't see the followers list of this user`);
    }
    const followers = await this.followers({
      userId: targetUserId,
      page: page as number,
      limit: limit as number,
      search: search as string,
    });

    return followers;
  }

  //TODO : following list

  //TODO : follow requests list

  //TODO : followers list of another user

  //TODO : following list of another user
}

export const followService = new FollowService();
