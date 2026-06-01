import { Job, Worker } from "bullmq";
import { S3_QUEUE_NAME } from "../queues/s3.queue.js";
import { ioredis } from "../ioredis.queue.connection.js";

import { s3Process } from "../process/s3.processes.js";
import { s3Service } from "../../../common/services/s3.service.js";
import { JobEnum } from "../../../common/enums/job.enums.js";

export class S3Worker {
  private worker: Worker;
  private readonly s3Process = s3Process;
  private readonly s3 = s3Service;

  constructor() {
    this.worker = new Worker(S3_QUEUE_NAME, this.process.bind(this), {
      connection: ioredis,
      concurrency: 3,
    });
    this.registerEvents();
  }

  //process
  process = async (job: Job) => {
    try {
      switch (job.name) {
        case JobEnum.UPLOAD_POST_MEDIA:
          return await this.s3Process.processPostMedia(job.data);

        case JobEnum.S3_DELETE_ASSETS:
          return await this.s3.deleteAssets(job.data);

        case JobEnum.UPDATE_POST_MEDIA:
          return await this.s3Process.processUpdatePostMedia(job.data);

        default:
          throw new Error(`Unknown job: ${job.name}`);
      }
    } catch (error) {
      console.error(`Job ${job.id} (${job.name}) failed:`, error);
      throw error;
    }
  };

  //events
  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} Completed Successfully`);
    });
    this.worker.on("failed", (job, error) => {
      console.log(`S3 failed ${job?.id}`, error);
    });
  }
}
