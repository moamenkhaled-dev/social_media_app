import z from "zod";
import { ShowFollowEnum } from "../../common/enums/settings.enums.js";
import {
  LanguageEnum,
  ProfileVisibilityEnum,
} from "../../common/enums/profile.enums.js";

class SettingsValidation {
  //update settings
  updateSettings = z.strictObject({
    profileVisibility: z.enum(ProfileVisibilityEnum).optional(),
    showOnLineStatus: z.boolean().optional(),
    showLastSeen: z.boolean().optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    showDOB: z.boolean().optional(),
    showJoinedAt: z.boolean().optional(),
    showEducation: z.boolean().optional(),
    showRelation: z.boolean().optional(),
    showFollowersList: z.enum(ShowFollowEnum).optional(),
    showFollowingsList: z.enum(ShowFollowEnum).optional(),
    language: z.enum(LanguageEnum).optional(),
    showInSearch: z.boolean().optional(),
    showInRecommendations: z.boolean().optional(),
    allowNotifications: z.boolean().optional(),
    allowGroupAdding: z.boolean().optional(),
  });
}

export const settingsValidation = new SettingsValidation();
