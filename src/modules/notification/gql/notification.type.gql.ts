import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class NotificationGQLType {
  private readonly graphQLTypes = graphQLTypes;

  //notification list
  notificationList = new GraphQLObjectType({
    name: "notificationSchemaType",
    fields: {
      data: {
        type: new GraphQLNonNull(
          new GraphQLList(this.graphQLTypes.oneNotificationType),
        ),
      },
      meta: {
        type: new GraphQLNonNull(this.graphQLTypes.onePaginationMetaType),
      },
    },
  });
}

export const notificationGQLType = new NotificationGQLType();
