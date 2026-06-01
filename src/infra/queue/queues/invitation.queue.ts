import { Queue } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";

export const INVITATION_QUEUE_NAME = "Invitation_Queue";
export const invitationQueue = new Queue(INVITATION_QUEUE_NAME, {
  connection: ioredis,
});
