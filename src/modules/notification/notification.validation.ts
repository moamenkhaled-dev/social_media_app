import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

export class NotificationValidationSchema {
  constructor() {}

  //create notification
  createNotification = z.strictObject({
    recipientId: generalValidationFields.id.optional(),
    actorId: generalValidationFields.id,
    notificationType: generalValidationFields.notificationType,
    notificationTargetType: generalValidationFields.notificationTargetType,
    notificationTargetId: generalValidationFields.id,
    title: generalValidationFields.nullString,
    body: generalValidationFields.nullString,
    postId: generalValidationFields.id.optional(),
    commentId: generalValidationFields.id.optional(),
    messageId: generalValidationFields.id.optional(),
    username: generalValidationFields.nullString.optional(),
    avatarUrl: generalValidationFields.nullString.optional(),
    pushStatus: generalValidationFields.pushStatus.optional(),
  });
}
