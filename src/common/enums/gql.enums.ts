import { GraphQLEnumType } from "graphql";
import {
  GenderEnum,
  LanguageEnum,
  ProfileVisibilityEnum,
  RelationEnum,
} from "./profile.enums.js";
import { PostStatusEnum, PostVisibilityEnum } from "./post.enums.js";
import { LogoutFlagEnum } from "./security.enums.js";
import { ChatTypeEnum } from "./chat.enums.js";
import { MessageTypeEnum } from "./message.enums.js";
import { ShowFollowEnum } from "./settings.enums.js";

//gender
export const GQLGenderEnum = new GraphQLEnumType({
  name: "GenderEnum",
  values: {
    Male: { value: GenderEnum.MALE },
    Female: { value: GenderEnum.FEMALE },
  },
});

//relation
export const GQLRelationEnum = new GraphQLEnumType({
  name: "relationEnum",
  values: {
    Single: { value: RelationEnum.SINGLE },
    Married: { value: RelationEnum.MARRIED },
  },
});

//profile visibility
export const GQLProfileVisibilityEnum = new GraphQLEnumType({
  name: "GraphQLProfileVisibilityEnum",
  values: {
    Public: { value: ProfileVisibilityEnum.PUBLIC },
    Private: { value: ProfileVisibilityEnum.PRIVATE },
  },
});

//post visibility
export const GQLPostVisibilityEnum = new GraphQLEnumType({
  name: "GraphQLPosVisibilityEnum",
  values: {
    Public: { value: PostVisibilityEnum.PUBLIC },
    Private: { value: PostVisibilityEnum.PRIVATE },
    Followers_Only: { value: PostVisibilityEnum.FOLLOWERS_ONLY },
  },
});

//post status
export const GQLPostStatusEnum = new GraphQLEnumType({
  name: "GraphQLPostStatusEnum",
  values: {
    Processing: { value: PostStatusEnum.PROCESSING },
    Published: { value: PostStatusEnum.PUBLISHED },
    Failed: { value: PostStatusEnum.FAILED },
  },
});

//logout flag
export const GraphQLLogoutFlagEnum = new GraphQLEnumType({
  name: "graphLogoutFlagEnum",
  values: {
    ALL: { value: LogoutFlagEnum.ALL },
    ONE: { value: LogoutFlagEnum.ONE },
  },
});

export const GraphQLChatTypeEnum = new GraphQLEnumType({
  name: "GraphQLChatTypeEnum",
  values: {
    OVO: { value: ChatTypeEnum.OVO },
    OVM: { value: ChatTypeEnum.OVM },
  },
});

export const GraphQLMessageTypeEnum = new GraphQLEnumType({
  name: "GraphQLMessageType",
  values: {
    Text: { value: MessageTypeEnum.TEXT },
    Image: { value: MessageTypeEnum.IMAGE },
    Video: { value: MessageTypeEnum.VIDEO },
    Audio: { value: MessageTypeEnum.AUDIO },
    File: { value: MessageTypeEnum.FILE },
    Mixed: { value: MessageTypeEnum.MIXED },
    System: { value: MessageTypeEnum.SYSTEM },
  },
});

export const GraphQLShowFollowEnum = new GraphQLEnumType({
  name: "GraphQLShowFollowEnum",
  values: {
    Only_Me: { value: ShowFollowEnum.ONLY_ME },
    Followers: { value: ShowFollowEnum.FOLLOWERS },
    Anyone: { value: ShowFollowEnum.ANYONE },
  },
});

export const GraphQLLanguageEnum = new GraphQLEnumType({
  name: "GraphQLLanguageEnum",
  values: {
    Arabic: { value: LanguageEnum.ARABIC },
    English: { value: LanguageEnum.ENGLISH },
  },
});
