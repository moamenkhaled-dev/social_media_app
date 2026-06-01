import { GraphQLInt } from "graphql";

class NotificationGQLArgs {
  //notification list
  notificationList = {
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  };
}

export const notificationGQLArgs = new NotificationGQLArgs();
