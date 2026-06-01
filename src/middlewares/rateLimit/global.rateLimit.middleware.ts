import { createLimiter } from "./factory.rateLimit.middleware.js";

export const globalLimiter = createLimiter({ windowMs: 60 * 1000, limit: 100 });
