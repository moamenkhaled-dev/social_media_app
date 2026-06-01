import { notificationGQLArgs } from "./notification.args.gql.js";
import { notificationGQLResolver } from "./notification.resolver.js";
import { notificationGQLType } from "./notification.type.gql.js";

class NotificationGraphQLSchema {
  private readonly notificationType = notificationGQLType;
  private readonly notificationArgs = notificationGQLArgs;
  private readonly notificationResolver = notificationGQLResolver;

  //query
  registerQuery() {
    return {
      //notification list
      notificationList: {
        description: "Notification list query schema",
        type: this.notificationType.notificationList,
        args: this.notificationArgs.notificationList,
        resolve: this.notificationResolver.notificationList,
      },
    };
  }
}

export const notificationGraphQLSchema = new NotificationGraphQLSchema();
