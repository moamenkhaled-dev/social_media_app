import { model, Schema, Types } from "mongoose";
import type {
  ILocation,
  IProfile,
} from "../../../common/interfaces/profile.interfaces.js";
import {
  GenderEnum,
  ProfileVisibilityEnum,
} from "../../../common/enums/profile.enums.js";
import { Post } from "./post.model.js";

const locationSchema = new Schema<ILocation>({
  country: String,
  city: String,
});

const profileSchema = new Schema<IProfile>(
  {
    ownerId: {
      type: Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    username: { type: String, minlength: 3, maxlength: 25, required: true },
    joinedAt: { type: Date, default: new Date() },
    avatarUrl: String,
    coverUrls: [String],
    bio: String,
    education: String,
    website: String,
    location: { type: locationSchema, default: {} },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.MALE },
    DOB: Date,
    relationship: String,
    visibility: {
      type: String,
      enum: ProfileVisibilityEnum,
      default: ProfileVisibilityEnum.PUBLIC,
    },
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
export const Profile = model<IProfile>("Profile", profileSchema);
