import type { HydratedDocument } from "mongoose";
import type { INotification } from "../../common/interfaces/notification.interfaces.js";
import { NotificationRepository } from "../../infra/repository/index.js";
import type {
  CreateOneNotificationDto,
  NotificationListDto,
} from "./notification.js";
import type { INotificationList } from "./notification.entity.js";
import { NOTIFICATION_LIST_PROJECTION } from "../../common/constants/notification.constants.js";

class NotificationService {
  private readonly notificationRepository: NotificationRepository;
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  //create notification
  async createOneNotification(
    inputs: CreateOneNotificationDto,
  ): Promise<HydratedDocument<INotification>> {
    const {
      recipientId,
      actorId,
      notificationType,
      notificationTargetType,
      notificationTargetId,
      title,
      body,
      postId,
      commentId,
      messageId,
      username,
      avatarUrl,
      pushStatus,
    } = inputs;

    const notification = await this.notificationRepository.createOne({
      data: {
        recipientId,
        actorId,
        notificationType,
        notificationTargetType,
        notificationTargetId,
        title,
        body,
        pushStatus,
        data: {
          postId,
          commentId,
          messageId,
          username,
          avatarUrl,
        },
      },
    });

    return notification as HydratedDocument<INotification>;
  }

  //notification list
  async notificationList(
    inputs: NotificationListDto,
  ): Promise<INotificationList> {
    const { user, page, limit } = inputs;
    const list = await this.notificationRepository.paginate({
      filter: { recipientId: user._id },
      projection: NOTIFICATION_LIST_PROJECTION,
      page: page as number,
      limit: limit as number,
    });

    return list;
  }
}

export const notificationService = new NotificationService();
