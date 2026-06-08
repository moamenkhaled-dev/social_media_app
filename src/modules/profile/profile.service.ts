import type { IAuth } from "../auth/auth.js";
import type { GetProfileByIdDto, GetStatsDto } from "./profile.js";
import {
  BlockRepository,
  FollowRepository,
  ProfileRepository,
  SettingsRepository,
  StatsRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import { NotFoundError } from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { UserVersionContextEnum } from "../../common/enums/redis.enums.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import type { HydratedDocument, Types } from "mongoose";
import type { IProfile } from "../../common/interfaces/profile.interfaces.js";
import { ProfileVisibilityEnum } from "../../common/enums/profile.enums.js";
import type { IStats } from "../../common/interfaces/stats.interfaces.js";
import type { ISettings } from "../../common/interfaces/settings.interfaces.js";
import type { IUser } from "../../common/interfaces/user.interfaces.js";
import { InternalServerError } from "../../common/errors/server.errors.js";

export type OwnerProfileprofile = {
  profile: HydratedDocument<IProfile>;
  stats: HydratedDocument<IStats>;
  email: string | undefined;
  phone: string | undefined;
};

export type Profileprofile = {
  profile: Partial<IProfile> | HydratedDocument<IProfile>;
  stats: HydratedDocument<IStats>;
  email?: string | undefined;
  phone?: string | undefined;
  lastSeenAt?: Date | undefined;
};

class ProfileService {
  private readonly profileRepository: ProfileRepository;
  private readonly settingsRepository: SettingsRepository;
  private readonly userRepository: UserRepository;
  private readonly statsRepository: StatsRepository;
  private readonly followRepository: FollowRepository;
  private readonly blockRepository: BlockRepository;
  private readonly redis = redisService;

  constructor() {
    this.profileRepository = new ProfileRepository();
    this.settingsRepository = new SettingsRepository();
    this.statsRepository = new StatsRepository();
    this.followRepository = new FollowRepository();
    this.blockRepository = new BlockRepository();
    this.userRepository = new UserRepository();
  }

  // private async fetchProfile(
  //   ownerId: Types.ObjectId | string,
  // ): Promise<HydratedDocument<IProfile> | null> {
  //   const version = await this.redis.getUserVersion(ownerId);
  //   return this.redis.cache<HydratedDocument<IProfile> | null>({
  //     key: this.redis.userProfileKey({ id: ownerId, version }),
  //     ttl: CacheTTL.PROFILE,
  //     fn: () =>
  //       this.profileRepository.findOne({
  //         filter: { ownerId },
  //         options: { populate: [{ path: "posts" }] },
  //       }),
  //   });
  // }
  // private async fetchStats(
  //   ownerId: Types.ObjectId | string,
  // ): Promise<HydratedDocument<IStats> | null> {
  //   const version = await this.redis.getUserVersion(ownerId);

  //   return this.redis.cache<HydratedDocument<IStats> | null>({
  //     key: this.redis.userStatsKey({ id: ownerId, version }),
  //     ttl: CacheTTL.STATS,
  //     fn: () => this.statsRepository.findOne({ filter: { ownerId } }),
  //   });
  // }
  // private async buildOwnerprofile(
  //   user: HydratedDocument<IUser>,
  //   profile: HydratedDocument<IProfile>,
  // ): Promise<OwnerProfileprofile> {
  //   const wholeProfileVersion = await this.redis.getUserVersion(user._id);
  //   const wholeProfileKey = this.redis.wholeProfileKey({
  //     id: user._id,
  //     version: wholeProfileVersion,
  //   });
  //   const cached = await this.redis.get<OwnerProfileprofile>(wholeProfileKey);
  //   if (cached) return cached;

  //   const stats = await this.fetchStats(user._id);
  //   if (!stats) throw new NotFoundError("Something went wrong");
  //   const profile: OwnerProfileprofile = {
  //     profile,
  //     stats,
  //     email: user.email ?? undefined,
  //     phone: user.phone ?? undefined,
  //   };
  //   await this.redis.set({
  //     key: wholeProfileKey,
  //     value: profile,
  //     options: { expiration: { type: "EX", value: CacheTTL.PROFILE } },
  //   });

  //   return profile;
  // }

  //profile

  async profile(
    inputs: IAuth,
  ): Promise<{ profile: HydratedDocument<IProfile>; stats: IStats }> {
    const { user } = inputs;
    const profileVersion = await this.redis.getProfileVersion(user._id);
    const profileKey = this.redis.profileKey({
      id: user._id,
      version: profileVersion,
    });
    const statsVersion = await this.redis.getStatsVersion(user._id);
    const statsKey = this.redis.userStatsKey({
      id: user._id,
      version: statsVersion,
    });
    const [profile, stats] = await Promise.all([
      //profile
      this.redis.cache({
        key: profileKey,
        ttl: CacheTTL.PROFILE,
        fn: () =>
          this.profileRepository.findOne({
            filter: { ownerId: user._id },
            options: {
              populate: [
                {
                  path: "ownerId",
                  select: "email phone _id",
                  populate: [{ path: "posts" }],
                },
              ],
            },
          }),
      }),
      //stats
      this.redis.cache({
        key: statsKey,
        ttl: CacheTTL.STATS,
        fn: () =>
          this.statsRepository.findOne({
            filter: { ownerId: user._id },
          }),
      }),
    ]);
    if (!profile || !stats) {
      throw new InternalServerError(
        `Something went wrong please try again later`,
      );
    }
    console.log({ profile, stats });

    return { profile, stats };
  }

  //get profile by id
  async getProfileById(
    inputs: GetProfileByIdDto,
  ): Promise<{ profile: any; stats: IStats }> {
    const { user, targetId } = inputs;
    if (user._id.equals(targetId)) {
      return await this.profile({ user });
    }
    const version = await this.redis.getSettingsVersion(targetId);
    const key = this.redis.settingsKey({ userId: targetId, version });
    const [
      isFollower,
      targetSettings,
      isBlock,
      targetUser,
      targetProfile,
      stats,
    ] = await Promise.all([
      //isFollower
      this.followRepository.findOne({
        filter: { followerId: user._id, followingId: targetId },
      }),
      //settings
      this.redis.cache({
        key,
        ttl: CacheTTL.SETTINGS,
        fn: () =>
          this.settingsRepository.findOne({ filter: { ownerId: targetId } }),
      }),
      //isBlock
      this.blockRepository.findOne({
        filter: {
          $or: [
            { blockerId: user._id, blockedId: targetId },
            { blockerId: targetId, blockedId: user._id },
          ],
        },
      }),
      //targetUser
      this.userRepository.findOne({ filter: { _id: targetId } }),
      //targetProfile
      this.profileRepository.findOne({
        filter: { ownerId: targetId },
        options: {
          populate: [
            {
              path: "ownerId",
              select: "_id email phone",
              populate: [{ path: "posts" }],
            },
          ],
        },
      }),
      this.redis.cache({
        key,
        ttl: CacheTTL.STATS,
        fn: () =>
          this.statsRepository.findOne({ filter: { ownerId: targetId } }),
      }),
    ]);
    if (!targetSettings || !targetUser || isBlock || !targetProfile || !stats) {
      throw new NotFoundError(`User not found`);
    }
    if (!isFollower) {
      if (targetProfile.visibility === ProfileVisibilityEnum.PRIVATE) {
        return {
          profile: {
            _id: targetProfile._id,
            ownerId: targetProfile.ownerId,
            username: targetProfile.username,
            avatarUrl: targetProfile.avatarUrl,
          },
          stats,
        };
      }
    }
    const profile = targetProfile.toObject();

    if (targetSettings.privacy.showDOB === false) delete profile.DOB;
    if (targetSettings.privacy.showEducation === false)
      delete profile.education;
    if (targetSettings.privacy.showJoinedAt === false) delete profile.joinedAt;
    if (targetSettings.privacy.showLocation === false) delete profile.location;
    if (targetSettings.privacy.showRelation === false)
      delete profile.relationship;
    if (profile.ownerId) {
      if (targetSettings.privacy.showEmail === false)
        delete (profile.ownerId as IUser).email;
      if (targetSettings.privacy.showPhone === false)
        delete (profile.ownerId as IUser).phone;
      if (targetSettings.privacy.showLastSeen === false)
        delete (profile.ownerId as IUser).lastSeenAt;
    }

    return { profile, stats };
  }

  //get stats
  async getStats(inputs: GetStatsDto): Promise<IStats> {
    const { targetId } = inputs;
    const targetUser = await this.userRepository.findOne({
      filter: { _id: targetId },
    });
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }
    const version = await this.redis.getStatsVersion(targetId);
    const key = this.redis.userStatsKey({
      id: targetId,
      version,
    });
    const stats = await this.redis.cache({
      key,
      ttl: CacheTTL.STATS,
      fn: () =>
        this.statsRepository.findOne({
          filter: { ownerId: targetId },
        }),
    });
    if (!stats) {
      throw new NotFoundError("Stats not found");
    }

    return stats;
  }
}

export const profileService = new ProfileService();
