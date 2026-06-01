import { redisService } from "../../common/services/index.js";

type IncrResult = {
  totalHits: number;
  resetTime: Date;
};

export const redisStore = (windowMs: number) => {
  const ttl = Math.ceil(windowMs / 1000);

  return {
    async increment(key: string): Promise<IncrResult> {
      const count = await redisService.incr(key);
      if (count === 1) {
        await redisService.expire({ key, seconds: ttl });
      }

      return {
        totalHits: count,
        resetTime: new Date(Date.now() + windowMs),
      };
    },

    async decrement(key: string): Promise<void> {
      await redisService.decr(key);
    },

    async resetKey(key: string): Promise<void> {
      await redisService.del([key]);
    },
  };
};
