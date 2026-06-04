import { Job, Worker } from "bullmq";
import { SOCIAL_QUEUE_NAME } from "../queues/social.queue.js";
import { ioredis } from "../ioredis.queue.connection.js";
import { JobEnum } from "../../../common/enums/job.enums.js";
import { socialProcess } from "../process/social.processes.js";
import { InternalServerError } from "../../../common/errors/server.errors.js";

export class SocialWorker {
  private worker: Worker;
  private readonly socialProcess = socialProcess;

  constructor() {
    this.worker = new Worker(SOCIAL_QUEUE_NAME, this.process.bind(this), {
      connection: ioredis,
      concurrency: 10,
    });
    this.registerEvents();
  }

  //process
  private process = async (job: Job) => {
    try {
      switch (job.name) {
        case JobEnum.BLOCK:
          await this.socialProcess.block(job.data);
          break;

        default:
          throw new InternalServerError(`unknown job: ${job.name}`);
      }
    } catch (error) {
      console.error(`Job ${job.id} (${job.name}) failed:`, error);
      throw error;
    }
  };

  //register events
  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} Completed Successfully`);
    });
    this.worker.on("failed", (job, error) => {
      console.log(`Social failed ${job?.id}`, error);
    });
  }
}
