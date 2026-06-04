import { Queue } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";

export const SOCIAL_QUEUE_NAME = "social-queue";
export const socialQueue = new Queue(SOCIAL_QUEUE_NAME, {
  connection: ioredis,
});
