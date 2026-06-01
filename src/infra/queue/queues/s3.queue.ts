import { Queue, QueueEvents } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";

export const S3_QUEUE_NAME = "s3-queue";
export const s3Queue = new Queue(S3_QUEUE_NAME, { connection: ioredis });
export const s3QueueEvents = new QueueEvents(S3_QUEUE_NAME, {
  connection: ioredis,
});
