import { GraphQLString } from "graphql";
import { userGraphQLArgs } from "./user.args.gql.js";
import { userResolver } from "./user.resolver.js";
import { userGraphQLType } from "./user.type.gql.js";

class UserGraphQLSchema {
  private readonly userType = userGraphQLType;
  private readonly userArgs = userGraphQLArgs;
  private readonly userResolver = userResolver;

  //query
  registerQuery() {
    return {
      //dummy
      dummy: {
        description: "Dummy query for testing",
        type: GraphQLString,
        resolve: () => "User module is working 🚀",
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      //refresh token
      refreshToken: {
        description: "refresh token mutation schema",
        type: this.userType.refreshToken,
        resolve: this.userResolver.refreshToken,
      },

      //logout
      logout: {
        description: "logout mutation schema",
        args: this.userArgs.logout,
        type: this.userType.logout,
        resolve: this.userResolver.logout,
      },
    };
  }
}

export const userGraphQLSchema = new UserGraphQLSchema();
