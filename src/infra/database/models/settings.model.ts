import { model, Schema, Types } from "mongoose";
import type {
  IPrivacy,
  ISettings,
} from "../../../common/interfaces/settings.interfaces.js";
import {
  LanguageEnum,
  ProfileVisibilityEnum,
} from "../../../common/enums/profile.enums.js";

const privacySchema = new Schema<IPrivacy>({
  profileVisibility: {
    type: String,
    enum: ProfileVisibilityEnum,
    default: ProfileVisibilityEnum.PUBLIC,
  },
  showOnLineStatus: { type: Boolean, default: true },
  showLastSeen: { type: Boolean, default: true },
  showEmail: { type: Boolean, default: false },
  showPhone: { type: Boolean, default: false },
  showLocation: { type: Boolean, default: true },
  showDOB: { type: Boolean, default: true },
  showJoinedAt: { type: Boolean, default: true },
  showEducation: { type: Boolean, default: true },
  showRelation: { type: Boolean, default: true },
});

const settingsSchema = new Schema<ISettings>(
  {
    ownerId: {
      type: Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    privacy: { type: privacySchema, default: {} },
    language: {
      type: String,
      enum: LanguageEnum,
      default: LanguageEnum.ENGLISH,
    },
    showInSearch: { type: Boolean, default: true },
    showInRecommendations: { type: Boolean, default: true },
    allowNotifications: { type: Boolean, default: true },
    allowGroupAdding: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//export model
export const Settings = model<ISettings>("Settings", settingsSchema);
