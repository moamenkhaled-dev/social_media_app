import { GraphQLID, GraphQLNonNull } from "graphql";

class ProfileGraphQLArgs {
  //get profile by id
  getProfileById = { targetId: { type: new GraphQLNonNull(GraphQLID) } };
}

export const profileGraphQLArgs = new ProfileGraphQLArgs();
