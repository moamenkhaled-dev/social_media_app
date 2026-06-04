import { GraphQLString } from "graphql";
import { settingsGraphQLArgs } from "./settings.args.gql.js";
import { settingsResolver } from "./settings.resolver.js";
import { settingsGraphQLType } from "./settings.types.gql.js";

class SettingsGraphQLSchema {
  private readonly settingsType = settingsGraphQLType;
  private readonly settingsArgs = settingsGraphQLArgs;
  private readonly settingsResolver = settingsResolver;

  //query
  registerQuery() {
    return {
      //get settings
      getSettings: {
        description: `get settings of current user`,
        type: this.settingsType.settings,
        resolve: this.settingsResolver.getSettings,
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      //update settings
      updateSettings: {
        description: `update settings of current user`,
        type: this.settingsType.settings,
        args: this.settingsArgs.updateSettings,
        resolve: this.settingsResolver.updateSettings,
      },
    };
  }
}

export const settingsGraphQLSchema = new SettingsGraphQLSchema();
