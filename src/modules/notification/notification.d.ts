import type z from "zod";
import { NotificationValidationSchema } from "./notification.validation.ts";
import type { IAuth } from "../auth/auth.js";
import type { PaginationDto } from "../../common/validation/paginate.validation.ts";

const notificationValidationSchema = new NotificationValidationSchema();

export type CreateOneNotificationDto = z.infer<
  typeof notificationValidationSchema.createNotification
>;

export type NotificationListDto = IAuth & PaginationDto;
