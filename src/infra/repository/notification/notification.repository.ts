import type { INotification } from "../../../common/interfaces/notification.interfaces.js";
import { Notification } from "../../database/models/notification.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class NotificationRepository extends DataBaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}
