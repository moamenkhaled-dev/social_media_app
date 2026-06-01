import { profileGraphQLArgs } from "./profile.args.gql.js";
import { profileResolver } from "./profile.resolver.js";
import { profileGraphQLType } from "./profile.type.gql.js";

class ProfileGraphQLSchema {
  private readonly profileType = profileGraphQLType;
  private readonly profileArgs = profileGraphQLArgs;
  private readonly profileResolver = profileResolver;

  //query
  registerQuery() {
    return {
      //profile
      profile: {
        description: "User profile query schema",
        type: this.profileType.profile,
        resolve: this.profileResolver.profile,
      },

      //get profile by id
      getProfileById: {
        description: "Get user profile by id query schema",
        type: this.profileType.getProfileById,
        args: this.profileArgs.getProfileById,
        resolve: this.profileResolver.getProfileById,
      },
    };
  }

  //mutation
  registerMutation() {
    return {};
  }
}

export const profileGraphQLSchema = new ProfileGraphQLSchema();
