import type { Types } from "mongoose";
import type {
  LanguageEnum,
  ProfileVisibilityEnum,
} from "../enums/profile.enums.js";
import type { ShowFollowEnum } from "../enums/settings.enums.js";

export interface IPrivacy {
  profileVisibility?: ProfileVisibilityEnum;
  showOnLineStatus?: boolean;
  showLastSeen?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showDOB?: boolean;
  showJoinedAt?: boolean;
  showEducation?: boolean;
  showRelation?: boolean;
  showFollowersList?: ShowFollowEnum;
  showFollowingsList?: ShowFollowEnum;
}

export interface ISettings {
  ownerId: Types.ObjectId;
  privacy: IPrivacy;
  language?: LanguageEnum;
  showInSearch?: boolean;
  showInRecommendations?: boolean;
  allowNotifications?: boolean;
  allowGroupAdding?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
