import type { HydratedDocument } from "mongoose";
import type { INotification } from "../../common/interfaces/notification.interfaces.js";
import type { PaginateMetaType } from "../../infra/repository/base.repository.js";

export interface INotificationList {
  data: Array<HydratedDocument<INotification>>;
  meta: PaginateMetaType;
}
