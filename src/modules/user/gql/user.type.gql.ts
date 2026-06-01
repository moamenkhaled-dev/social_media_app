import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class UserGraphQLType {
  private readonly graphQLTypes = graphQLTypes;

  //refresh token
  refreshToken = new GraphQLObjectType({
    name: "refreshTokenType",
    fields: {
      data: {
        type: new GraphQLNonNull(
          new GraphQLObjectType({
            name: "refreshTokenDataType",
            fields: {
              accessToken: { type: new GraphQLNonNull(GraphQLString) },
              refreshToken: { type: new GraphQLNonNull(GraphQLString) },
            },
          }),
        ),
      },
    },
  });

  //logout
  logout = new GraphQLObjectType({
    name: "logoutType",
    fields: { message: { type: this.graphQLTypes.messageType } },
  });
}

export const userGraphQLType = new UserGraphQLType();
