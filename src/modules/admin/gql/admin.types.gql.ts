import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class AdminGraphQLType {
  private readonly graphQLType = graphQLTypes;

  //ban
  ban = new GraphQLObjectType({
    name: "banType",
    fields: { message: { type: this.graphQLType.messageType } },
  });

  //banned users list
  bannedUsersList = new GraphQLObjectType({
    name: "bannedUsersListType",
    fields: {
      message: { type: this.graphQLType.messageType },
      data: {
        type: new GraphQLList(
          new GraphQLObjectType({
            name: "bannedUsersListDataType",
            fields: {
              _id: { type: GraphQLID },
              user: {
                type: new GraphQLObjectType({
                  name: "bannedUsersListUserDataType",
                  fields: {
                    username: { type: GraphQLString },
                    avatarUrl: { type: GraphQLString },
                  },
                }),
              },
            },
          }),
        ),
      },
    },
  });

  //admin delete user
  adminDeleteUser = new GraphQLObjectType({
    name: "adminDeleteUserType",
    fields: {
      message: { type: this.graphQLType.messageType },
    },
  });
}

export const adminGraphQLType = new AdminGraphQLType();
