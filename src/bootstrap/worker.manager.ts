import { EmailWorker } from "../infra/queue/workers/email.worker.js";
import { InvitationWorker } from "../infra/queue/workers/invitation.worker.js";
import { NotificationWorker } from "../infra/queue/workers/notification.worker.js";
import { S3Worker } from "../infra/queue/workers/s3.worker.js";
import { SocialWorker } from "../infra/queue/workers/social.worker.js";

export class WorkerManager {
  private workers: Array<any> = [];

  //start
  start() {
    this.workers.push(
      new EmailWorker(),
      new NotificationWorker(),
      new S3Worker(),
      new InvitationWorker(),
      new SocialWorker(),
    );
    console.log("All workers started");
  }
}
