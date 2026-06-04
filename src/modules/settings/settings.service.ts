import { CacheTTL } from "../../common/constants/cache.constants.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import type { ISettings } from "../../common/interfaces/settings.interfaces.js";
import { redisService } from "../../common/services/redis.service.js";
import { SettingsRepository } from "../../infra/repository/index.js";
import type { IAuth } from "../auth/auth.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import type { UpdateSettingsDto } from "./settings.js";

class SettingsService {
  private readonly settingsRepository: SettingsRepository;
  private readonly redis = redisService;
  private get realtime() {
    return realtimeGateWay;
  }

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  //update settings
  async updateSettings(inputs: UpdateSettingsDto): Promise<ISettings> {
    const {
      user,
      profileVisibility,
      showOnLineStatus,
      showLastSeen,
      showEmail,
      showPhone,
      showLocation,
      showDOB,
      showJoinedAt,
      showEducation,
      showRelation,
      showFollowersList,
      showFollowingsList,
      language,
      showInSearch,
      showInRecommendations,
      allowNotifications,
      allowGroupAdding,
    } = inputs;
    const update: Record<string, unknown> = {};
    if (profileVisibility !== undefined)
      update["privacy.profileVisibility"] = profileVisibility;
    if (showOnLineStatus !== undefined)
      update["privacy.showOnLineStatus"] = showOnLineStatus;
    if (showLastSeen !== undefined)
      update["privacy.showLastSeen"] = showLastSeen;
    if (showEmail !== undefined) update["privacy.showEmail"] = showEmail;
    if (showPhone !== undefined) update["privacy.showPhone"] = showPhone;
    if (showLocation !== undefined)
      update["privacy.showLocation"] = showLocation;
    if (showDOB !== undefined) update["privacy.showDOB"] = showDOB;
    if (showJoinedAt !== undefined)
      update["privacy.showJoinedAt"] = showJoinedAt;
    if (showEducation !== undefined)
      update["privacy.showEducation"] = showEducation;
    if (showRelation !== undefined)
      update["privacy.showRelation"] = showRelation;
    if (showFollowersList !== undefined)
      update["privacy.showFollowersList"] = showFollowersList;
    if (showFollowingsList !== undefined)
      update["privacy.showFollowingsList"] = showFollowingsList;
    if (language !== undefined) update.language = language;
    if (showInSearch !== undefined) update.showInSearch = showInSearch;
    if (showInRecommendations !== undefined)
      update.showInRecommendations = showInRecommendations;
    if (allowNotifications !== undefined)
      update.allowNotifications = allowNotifications;
    if (allowGroupAdding !== undefined)
      update.allowGroupAdding = allowGroupAdding;
    if (!Object.keys(update).length) {
      throw new BadRequestError(`Enter data to update`);
    }
    const settings = await this.settingsRepository.findOneAndUpdate({
      filter: { ownerId: user._id },
      update,
    });
    if (!settings) {
      throw new NotFoundError(`Settings not found`);
    }
    await this.redis.incrementSettingsVersion(user._id);
    try {
      const socketIds = await this.redis.getSockets(user._id);
      if (socketIds.length) {
        this.realtime.getIo
          .to(socketIds)
          .emit("settings_updated", { userId: user._id });
      }
    } catch (error) {
      console.error("Failed to emit settings_updated", error);
    }

    return settings;
  }

  //get settings
  async getSettings(inputs: IAuth): Promise<any> {
    const { user } = inputs;
    const version = await this.redis.getSettingsVersion(user._id);
    const key = this.redis.settingsKey({ userId: user._id, version });
    const settings = await this.redis.cache({
      key,
      ttl: CacheTTL.SETTINGS,
      fn: () =>
        this.settingsRepository.findOne({ filter: { ownerId: user._id } }),
    });
    if (!settings) {
      throw new NotFoundError(`Settings not found`);
    }

    return settings;
  }

  //TODO : 2FA
}

export const settingsService = new SettingsService();
