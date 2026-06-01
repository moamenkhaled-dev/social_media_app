import { Worker } from "bullmq";
import type { Job } from "bullmq";

import { NOTIFICATION_QUEUE_NAME } from "../queues/notification.queue.js";
import { ioredis } from "../ioredis.queue.connection.js";

import { notificationProcess } from "../process/notification.processes.js";
import { InternalServerError } from "../../../common/errors/server.errors.js";
import { JobEnum } from "../../../common/enums/job.enums.js";

export class NotificationWorker {
  private worker: Worker;
  private readonly notificationProcess = notificationProcess;

  constructor() {
    this.worker = new Worker(NOTIFICATION_QUEUE_NAME, this.process.bind(this), {
      connection: ioredis,
      concurrency: 2,
    });
    this.registerEvents();
  }

  private async process(job: Job) {
    switch (job.name) {
      case JobEnum.SEND_MULTIPLE_NOTIFICATIONS:
        await this.notificationProcess.sendMultipleNotifications(job.data);
        break;

      default:
        throw new InternalServerError(`Unknown job name ${job.name}`);
    }
  }

  // events
  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`Notification job ${job.id} completed`);
    });

    this.worker.on("failed", (job, error) => {
      console.log(`Notification job ${job?.id} failed`, error);
    });
  }
}
