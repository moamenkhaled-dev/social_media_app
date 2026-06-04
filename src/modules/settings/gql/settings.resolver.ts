import type { ISettings } from "../../../common/interfaces/settings.interfaces.js";
import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type { GraphQLUpdateSettingsDto } from "../settings.js";
import { settingsService } from "../settings.service.js";
import { settingsValidation } from "../settings.validation.js";

class SettingsResolver {
  private readonly settingsValidation = settingsValidation;
  private readonly settingsService = settingsService;

  //update settings
  updateSettings = async (
    parent: any,
    {
      profileVisibility,
      showOnLineStatus,
      showLastSeen,
      showEmail,
      showPhone,
      showLocation,
      showDOB,
      showJoinedAt,
      showEducation,
      showRelation,
      showFollowersList,
      showFollowingsList,
      language,
      showInSearch,
      showInRecommendations,
      allowNotifications,
      allowGroupAdding,
    }: GraphQLUpdateSettingsDto,
    context: IGQqlContext,
  ): Promise<{
    message: string;
    data: ISettings;
  }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLUpdateSettingsDto>({
      schema: settingsValidation.updateSettings,
      args: {
        profileVisibility,
        showOnLineStatus,
        showLastSeen,
        showEmail,
        showPhone,
        showLocation,
        showDOB,
        showJoinedAt,
        showEducation,
        showRelation,
        showFollowersList,
        showFollowingsList,
        language,
        showInSearch,
        showInRecommendations,
        allowNotifications,
        allowGroupAdding,
      },
    });
    //service
    const settings = await this.settingsService.updateSettings({
      user,
      ...validatedData,
    });

    return { message: "Success", data: settings };
  };

  //get settings
  getSettings = async (
    parent: any,
    args: any,
    context: IGQqlContext,
  ): Promise<{
    message: string;
    data: ISettings;
  }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //service
    const settings = await this.settingsService.getSettings({ user });

    return { message: "Success", data: settings };
  };
}

export const settingsResolver = new SettingsResolver();
