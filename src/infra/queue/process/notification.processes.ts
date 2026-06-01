import { PushStatusEnum } from "../../../common/enums/notification.enums.js";
import type { ISendMultipleNotificationsData } from "../../../common/interfaces/notification.interfaces.js";
import { pushService } from "../../../common/services/push.service.js";
import { redisService } from "../../../common/services/redis.service.js";
import { NotificationRepository } from "../../repository/index.js";

class NotificationProcess {
  private readonly redis = redisService;
  private readonly push = pushService;
  private readonly notificationRepository = new NotificationRepository();

  //send multiple notifications
  async sendMultipleNotifications({
    userIds,
    title,
    body,
    notificationId,
  }: ISendMultipleNotificationsData) {
    const tokensArrays = await this.redis.pipeline<string[]>({
      items: userIds as unknown as string[][],
      command: (id, pipe) => {
        pipe.sMembers(this.redis.FCMKey(id as unknown as string));
      },
    });
    const tokens = [...new Set(tokensArrays.flat())];
    if (!tokens.length) {
      return;
    }

    const result = await this.push.sendMultipleNotifications({
      tokens,
      title,
      body,
    });
    if (result.successCount === 0) {
      await this.notificationRepository.findOneAndUpdate({
        filter: { _id: notificationId },
        update: { pushStatus: PushStatusEnum.FAILED },
      });
    }
    await this.notificationRepository.findOneAndUpdate({
      filter: { _id: notificationId },
      update: { pushStatus: PushStatusEnum.SENT, pushSentAt: new Date() },
    });
  }
}

export const notificationProcess = new NotificationProcess();
