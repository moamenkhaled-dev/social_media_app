import { GraphQLID } from "graphql";

class ProfileGraphQLArgs {
  //get profile by id
  getProfileById = { targetId: { type: GraphQLID } };
}

export const profileGraphQLArgs = new ProfileGraphQLArgs();
