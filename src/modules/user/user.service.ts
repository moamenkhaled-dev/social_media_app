import type { HydratedDocument } from "mongoose";
import {
  ConflictError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import type { IProfile } from "../../common/interfaces/profile.interfaces.js";
import {
  ProfileRepository,
  SettingsRepository,
  StatsRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import type { IAuth } from "../auth/auth.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../config/config.js";
import { redisService } from "../../common/services/redis.service.js";
import { tokenService } from "../../common/services/token.service.js";
import type { IRefreshTokenResponse } from "./user.entity.js";
import type { LogoutDto } from "./user.js";
import { LogoutFlagEnum } from "../../common/enums/security.enums.js";

class UserService {
  private readonly userRepository: UserRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly settingsRepository: SettingsRepository;
  private readonly statsRepository: StatsRepository;
  private readonly redis = redisService;
  private readonly tokenService = tokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.profileRepository = new ProfileRepository();
    this.settingsRepository = new SettingsRepository();
    this.statsRepository = new StatsRepository();
  }

  //refresh token
  async refreshToken(inputs: IAuth): Promise<IRefreshTokenResponse> {
    const { user, decode } = inputs;
    if (
      Date.now() + 3000 >
      ((decode?.iat as number) + ACCESS_TOKEN_EXPIRES_IN) * 1000
    ) {
      throw new ConflictError("the previous token still valid");
    }
    const revokeTokenKey = this.redis.revokeTokenKey({
      userId: user._id,
      jti: decode?.jti as string,
    });
    await this.redis.set({
      key: revokeTokenKey,
      value: decode?.jti,
      options: {
        expiration: {
          type: "EX",
          value: (decode?.iat as number) + REFRESH_TOKEN_EXPIRES_IN,
        },
      },
    });
    user.changeCredentialsTime = new Date();
    await user.save();

    return await this.tokenService.createLoginCredentials({ user });
  }

  //logout
  async logout(inputs: LogoutDto): Promise<{ message: string }> {
    const { user, decode, flag } = inputs;
    switch (flag) {
      case LogoutFlagEnum.ALL:
        user.changeCredentialsTime = new Date();
        user.lastSeenAt = new Date();
        await user.save();

        break;

      default:
        const key = this.redis.revokeTokenKey({
          userId: user._id,
          jti: decode?.jti as string,
        });
        await this.redis.set({
          key,
          value: decode?.jti,
          options: {
            expiration: {
              type: "EX",
              value: (decode?.iat as number) + REFRESH_TOKEN_EXPIRES_IN,
            },
          },
        });
        user.lastSeenAt = new Date();
        await user.save();

        break;
    }

    return { message: `logged out successfully` };
  }
}

export const userService = new UserService();
