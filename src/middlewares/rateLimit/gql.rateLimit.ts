import { TooManyRequestsError } from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";

export const graphQlRateLimit = async ({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) => {
  const count = await redisService.incr(key);
  if (count === 1) {
    await redisService.expire({ key, seconds: windowMs / 1000 });
  }
  if (count > limit) {
    throw new TooManyRequestsError();
  }
};
