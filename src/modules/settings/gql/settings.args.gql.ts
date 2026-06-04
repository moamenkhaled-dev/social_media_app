import { GraphQLBoolean } from "graphql";
import {
  GQLProfileVisibilityEnum,
  GraphQLLanguageEnum,
  GraphQLShowFollowEnum,
} from "../../../common/enums/gql.enums.js";

class SettingsGraphQLArgs {
  //update settings
  updateSettings = {
    profileVisibility: { type: GQLProfileVisibilityEnum },
    showOnLineStatus: { type: GraphQLBoolean },
    showLastSeen: { type: GraphQLBoolean },
    showEmail: { type: GraphQLBoolean },
    showPhone: { type: GraphQLBoolean },
    showLocation: { type: GraphQLBoolean },
    showDOB: { type: GraphQLBoolean },
    showJoinedAt: { type: GraphQLBoolean },
    showEducation: { type: GraphQLBoolean },
    showRelation: { type: GraphQLBoolean },
    showFollowersList: { type: GraphQLShowFollowEnum },
    showFollowingsList: { type: GraphQLShowFollowEnum },
    language: { type: GraphQLLanguageEnum },
    showInSearch: { type: GraphQLBoolean },
    showInRecommendations: { type: GraphQLBoolean },
    allowNotifications: { type: GraphQLBoolean },
    allowGroupAdding: { type: GraphQLBoolean },
  };
}

export const settingsGraphQLArgs = new SettingsGraphQLArgs();
