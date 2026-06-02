import type { IAuth } from "../auth/auth.js";
import type { GetProfileByIdDto } from "./profile.js";
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

export type OwnerProfileResponse = {
  profile: HydratedDocument<IProfile>;
  stats: HydratedDocument<IStats>;
  email: string | undefined;
  phone: string | undefined;
};

export type ProfileResponse = {
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

  private async fetchProfile(
    ownerId: Types.ObjectId | string,
  ): Promise<HydratedDocument<IProfile> | null> {
    const version = await this.redis.getUserVersion(ownerId);
    return this.redis.cache<HydratedDocument<IProfile> | null>({
      key: this.redis.userProfileKey({ id: ownerId, version }),
      ttl: CacheTTL.PROFILE,
      fn: () =>
        this.profileRepository.findOne({
          filter: { ownerId },
          options: { populate: [{ path: "posts" }] },
        }),
    });
  }
  private async fetchStats(
    ownerId: Types.ObjectId | string,
  ): Promise<HydratedDocument<IStats> | null> {
    const version = await this.redis.getUserVersion(ownerId);

    return this.redis.cache<HydratedDocument<IStats> | null>({
      key: this.redis.userStatsKey({ id: ownerId, version }),
      ttl: CacheTTL.STATS,
      fn: () => this.statsRepository.findOne({ filter: { ownerId } }),
    });
  }
  private async buildOwnerResponse(
    user: HydratedDocument<IUser>,
    profile: HydratedDocument<IProfile>,
  ): Promise<OwnerProfileResponse> {
    const wholeProfileVersion = await this.redis.getUserVersion(user._id);
    const wholeProfileKey = this.redis.wholeProfileKey({
      id: user._id,
      version: wholeProfileVersion,
    });
    const cached = await this.redis.get<OwnerProfileResponse>(wholeProfileKey);
    if (cached) return cached;

    const stats = await this.fetchStats(user._id);
    if (!stats) throw new NotFoundError("Something went wrong");
    const response: OwnerProfileResponse = {
      profile,
      stats,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    };
    await this.redis.set({
      key: wholeProfileKey,
      value: response,
      options: { expiration: { type: "EX", value: CacheTTL.PROFILE } },
    });

    return response;
  }

  //profile
  async profile(inputs: IAuth): Promise<OwnerProfileResponse> {
    const { user } = inputs;
    const wholeProfileVersion = await this.redis.getUserVersion(user._id);
    const wholeProfileKey = this.redis.wholeProfileKey({
      id: user._id,
      version: wholeProfileVersion,
    });
    const cached = await this.redis.get<OwnerProfileResponse>(wholeProfileKey);
    if (cached) return cached;
    const [profile, stats] = await Promise.all([
      this.fetchProfile(user._id),
      this.fetchStats(user._id),
    ]);
    if (!profile) throw new NotFoundError("Profile not found");
    if (!stats) throw new NotFoundError("Something went wrong");
    const response: OwnerProfileResponse = {
      profile,
      stats,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    };
    await this.redis.set({
      key: wholeProfileKey,
      value: response,
      options: { expiration: { type: "EX", value: CacheTTL.PROFILE } },
    });

    return response;
  }

  //get profile by id
  async getProfileById(inputs: GetProfileByIdDto): Promise<ProfileResponse> {
    const { user, targetId } = inputs;
    const targetUser = await this.userRepository.findOne({
      filter: { _id: targetId },
      projection: "email phone lastSeenAt",
    });
    if (!targetUser) throw new NotFoundError("User not found");
    const userProfile = await this.fetchProfile(targetUser._id);
    if (!userProfile) throw new NotFoundError("Profile not found");
    if (user._id.toString() === userProfile.ownerId.toString()) {
      const ownerRes = await this.buildOwnerResponse(targetUser, userProfile);
      return {
        profile: ownerRes.profile,
        stats: ownerRes.stats,
        email: ownerRes.email,
        phone: ownerRes.phone,
      };
    }
    const [settingsVersion, statsVersion] = await Promise.all([
      this.redis.getUserVersion(targetUser._id),
      this.redis.getUserVersion(targetUser._id),
    ]);
    const [isBlocked, settings, stats, isFollower] = await Promise.all([
      this.blockRepository.findOne({
        filter: {
          $or: [
            { blockerId: user._id, blockedId: targetUser._id },
            { blockerId: targetUser._id, blockedId: user._id },
          ],
        },
      }),
      this.redis.cache<HydratedDocument<ISettings> | null>({
        key: this.redis.userSettingsKey({
          id: targetUser._id,
          version: settingsVersion,
        }),
        ttl: CacheTTL.SETTINGS,
        fn: () =>
          this.settingsRepository.findOne({
            filter: { ownerId: targetUser._id },
          }),
      }),
      this.redis.cache<HydratedDocument<IStats> | null>({
        key: this.redis.userStatsKey({
          id: targetUser._id,
          version: statsVersion,
        }),
        ttl: CacheTTL.STATS,
        fn: () =>
          this.statsRepository.findOne({ filter: { ownerId: targetUser._id } }),
      }),
      this.followRepository.findOne({
        filter: { followerId: user._id, followingId: targetUser._id },
      }),
    ]);
    if (!settings || !stats || isBlocked) {
      throw new NotFoundError("User not found");
    }
    if (
      !isFollower &&
      userProfile.visibility === ProfileVisibilityEnum.PRIVATE
    ) {
      return {
        profile: {
          username: userProfile.username,
          avatarUrl: userProfile.avatarUrl,
          ownerId: userProfile.ownerId,
          _id: userProfile._id,
        },
        stats,
      };
    }
    const profile: ProfileResponse["profile"] = {
      ownerId: userProfile.ownerId,
      username: userProfile.username,
      gender: userProfile.gender,
    };
    const response: ProfileResponse = { profile, stats };
    if (settings.privacy.showDOB) profile.DOB = userProfile.DOB ?? undefined;
    if (settings.privacy.showEducation)
      profile.education = userProfile.education ?? undefined;
    if (settings.privacy.showJoinedAt)
      profile.joinedAt = userProfile.joinedAt ?? undefined;
    if (settings.privacy.showLocation)
      profile.location = userProfile.location ?? undefined;
    if (settings.privacy.showRelation)
      profile.relationship = userProfile.relationship ?? undefined;
    if (settings.privacy.showEmail)
      response.email = targetUser.email ?? undefined;
    if (settings.privacy.showPhone)
      response.phone = targetUser.phone ?? undefined;
    if (settings.privacy.showLastSeen)
      response.lastSeenAt = targetUser.lastSeenAt ?? undefined;

    return response;
  }
}

export const profileService = new ProfileService();
