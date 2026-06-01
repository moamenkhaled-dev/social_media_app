import { GraphQLNonNull } from "graphql";
import { GraphQLLogoutFlagEnum } from "../../../common/enums/gql.enums.js";

class UserGraphQLArgs {
  //logout
  logout = { flag: { type: new GraphQLNonNull(GraphQLLogoutFlagEnum) } };
}

export const userGraphQLArgs = new UserGraphQLArgs();
