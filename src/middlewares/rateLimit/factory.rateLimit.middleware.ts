import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Store } from "express-rate-limit";
import { KeyGeneratorEnum } from "../../common/enums/security.enums.js";
import { redisStore } from "./store.rateLimit.middleware.js";
import {
  BadRequestError,
  TooManyRequestsError,
} from "../../common/errors/client.errors.js";
import type { Request, Response, NextFunction } from "express";
import { redisService } from "../../common/services/redis.service.js";

export const createLimiter = ({
  windowMs,
  limit,
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
  keyGenerator = KeyGeneratorEnum.IP,
  store = redisStore(windowMs),
  requestPropertyName = "rateLimit",
}: {
  windowMs: number;
  limit: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: KeyGeneratorEnum;
  store?: Store;
  requestPropertyName?: string;
}) => {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req: Request) => {
      if (!req?.ip) {
        throw new BadRequestError("invalid ip");
      }
      let key: string;
      switch (keyGenerator) {
        case KeyGeneratorEnum.USER:
          key = redisService.userRateLimitKey({
            userId: req.user._id,
            path: req.path,
          });

          break;
        case KeyGeneratorEnum.EMAIL:
          key = redisService.emailRateLimitKey({
            email: req.user.email,
            path: req.path,
          });

          break;

        default:
          key = redisService.ipRateLimitKey({
            ip: ipKeyGenerator(req.ip, 56),
            path: req.path,
          });

          break;
      }

      return key;
    },
    store,
    requestPropertyName,
    handler(req: Request, res: Response, next: NextFunction) {
      throw new TooManyRequestsError();
    },
  });
};
