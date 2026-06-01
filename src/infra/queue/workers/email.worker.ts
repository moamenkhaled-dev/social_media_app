import { Worker } from "bullmq";
import type { Job } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.js";
import { JobEnum } from "../../../common/enums/job.enums.js";
import { sendMail } from "../../../common/utils/email/send.email.js";

export class EmailWorker {
  private worker: Worker;
  constructor() {
    this.worker = new Worker(EMAIL_QUEUE_NAME, this.process.bind(this), {
      connection: ioredis,
      concurrency: 2,
      //   limiter: { max: 100, duration: 60000 },
    });
    this.registerEvents();
  }

  //send mail
  private async process(job: Job) {
    try {
      switch (job.name) {
        case JobEnum.SEND_EMAIL:
          await sendMail(job.data);
          break;

        default:
          throw new Error(`Unknown job: ${job.name}`);
      }
    } catch (error) {
      console.error(`Email job failed ${job.id}`);
      throw error;
    }
  }

  //events
  private registerEvents() {
    this.worker.on("completed", (job) => {
      console.log(`Job ${job.id} Completed Successfully`);
    });
    this.worker.on("failed", (job, error) => {
      console.log(`Email failed ${job?.id}`, error);
    });
  }
}
