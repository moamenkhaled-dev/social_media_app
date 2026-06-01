import type { JwtPayload } from "jsonwebtoken";

import type { IGQqlContext } from "../../../common/types/gql.js";
import type { IRefreshTokenResponse } from "../user.entity.js";
import type { GraphQLLogoutDto } from "../user.js";
import { TokenTypeEnum } from "../../../common/enums/security.enums.js";
import { redisService } from "../../../common/services/redis.service.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { graphQlRateLimit } from "../../../middlewares/rateLimit/gql.rateLimit.js";
import { userService } from "../user.service.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { userValidationSchema } from "../user.validation.js";

class UserResolver {
  private readonly userService = userService;
  private readonly redis = redisService;
  private readonly userValidation = userValidationSchema;

  //refresh token
  refreshToken = async (
    parent: any,
    args: any,
    context: IGQqlContext,
  ): Promise<{ data: IRefreshTokenResponse }> => {
    //authentication
    const { user, decode } = await GQLAuthentication({
      context,
      tokenType: TokenTypeEnum.REFRESH,
    });
    //rate limit
    const key = this.redis.userRateLimitKey({
      userId: user._id,
      path: `refreshToken`,
    });
    await graphQlRateLimit({ key, limit: 30, windowMs: 60 * 1000 });
    //service
    const data = await this.userService.refreshToken({
      user,
      decode: decode as JwtPayload,
    });

    return { data };
  };

  //logout
  logout = async (
    parent: any,
    { flag }: GraphQLLogoutDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user, decode } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLLogoutDto>({
      schema: this.userValidation.logout,
      args: { flag },
    });
    //service
    const message = await this.userService.logout({
      user,
      decode: decode as JwtPayload,
      flag,
    });

    return message;
  };
}

export const userResolver = new UserResolver();
