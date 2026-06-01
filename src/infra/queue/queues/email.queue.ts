import { Queue } from "bullmq";

import { ioredis } from "../ioredis.queue.connection.js";

export const EMAIL_QUEUE_NAME = "email-queue";
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: ioredis,
});
