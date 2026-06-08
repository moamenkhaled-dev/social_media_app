import { adminGraphQLArgs } from "./admin.args.gql.js";
import { adminResolver } from "./admin.resolver.js";
import { adminGraphQLType } from "./admin.types.gql.js";

class AdminGraphQLSchema {
  private readonly adminType = adminGraphQLType;
  private readonly adminArgs = adminGraphQLArgs;
  private readonly adminResolver = adminResolver;

  registerQuery() {
    return {
      bannedUsersList: {
        description: "admin get banned users list",
        type: this.adminType.bannedUsersList,
        args: this.adminArgs.bannedUsersList,
        resolve: this.adminResolver.bannedUsersList,
      },
    };
  }

  registerMutation() {
    return {
      //ban
      ban: {
        description: "admin ban user",
        type: this.adminType.ban,
        args: this.adminArgs.ban,
        resolve: this.adminResolver.ban,
      },
      //unBan
      unBan: {
        description: "admin un ban user",
        type: this.adminType.ban,
        args: this.adminArgs.unBan,
        resolve: this.adminResolver.unBan,
      },

      //admin delete user
      adminDeleteUser: {
        description: "admin delete user",
        type: this.adminType.adminDeleteUser,
        args: this.adminArgs.adminDeleteUser,
        resolve: this.adminResolver.adminDeleteUser,
      },
    };
  }
}

export const adminGraphQLSchema = new AdminGraphQLSchema();
