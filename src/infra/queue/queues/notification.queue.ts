import { Queue } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";

export const NOTIFICATION_QUEUE_NAME = "notification-queue";
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: ioredis,
});
