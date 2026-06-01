import type { Types } from "mongoose";
import type {
  GenderEnum,
  ProfileVisibilityEnum,
  RelationEnum,
} from "../enums/profile.enums.js";

export interface ILocation {
  country?: string;
  city?: string;
}

export interface IProfile {
  ownerId: Types.ObjectId;
  username: string;
  joinedAt?: Date | undefined;
  avatarUrl?: string | undefined;
  coverUrls?: Array<string>;
  bio?: string | undefined;
  education?: string | undefined;
  website?: string | undefined;
  location?: ILocation | undefined;
  gender: GenderEnum;
  DOB?: Date | undefined;
  relationship?: RelationEnum | undefined;
  visibility?: ProfileVisibilityEnum | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}
