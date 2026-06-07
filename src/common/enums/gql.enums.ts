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
import {
  ReportActionEnum,
  ReportPriorityEnum,
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "./report.enums.js";

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

//report reason
export const GraphQLReportReasonEnum = new GraphQLEnumType({
  name: "GraphQLReportReasonEnum",
  values: {
    SPAM: { value: ReportReasonEnum.SPAM },
    HARASSMENT: { value: ReportReasonEnum.HARASSMENT },
    HATE_SPEECH: { value: ReportReasonEnum.HATE_SPEECH },
    NUDITY: { value: ReportReasonEnum.NUDITY },
    VIOLENCE: { value: ReportReasonEnum.VIOLENCE },
    SCAM: { value: ReportReasonEnum.SCAM },
    COPYRIGHT: { value: ReportReasonEnum.COPYRIGHT },
    IMPERSONATION: { value: ReportReasonEnum.IMPERSONATION },
    OTHER: { value: ReportReasonEnum.OTHER },
  },
});

//report target type
export const GraphQLReportTargetTypeEnum = new GraphQLEnumType({
  name: "GraphQLReportTargetTypeEnum",
  values: {
    User: { value: ReportTargetTypeEnum.USER },
    Post: { value: ReportTargetTypeEnum.POST },
    Chat: { value: ReportTargetTypeEnum.CHAT },
    Comment: { value: ReportTargetTypeEnum.COMMENT },
    Message: { value: ReportTargetTypeEnum.MESSAGE },
  },
});

//report status
export const GraphQLReportStatusEnum = new GraphQLEnumType({
  name: "GraphQLReportStatusEnum",
  values: {
    PENDING: { value: ReportStatusEnum.PENDING },
    UNDER_REVIEW: { value: ReportStatusEnum.UNDER_REVIEW },
    RESOLVED: { value: ReportStatusEnum.RESOLVED },
    REJECTED: { value: ReportStatusEnum.REJECTED },
  },
});

//report action
export const GraphQLReportActionEnum = new GraphQLEnumType({
  name: "GraphQLReportActionEnum",
  values: {
    NoAction: { value: ReportActionEnum.NO_ACTION },
    ContentRemoved: { value: ReportActionEnum.CONTENT_REMOVED },
    ContentRestricted: { value: ReportActionEnum.CONTENT_RESTRICTED },
    WarningIssued: { value: ReportActionEnum.WARNING_ISSUED },
    UserMuted: { value: ReportActionEnum.USER_MUTED },
    UserSuspended: { value: ReportActionEnum.USER_SUSPENDED },
    UserBanned: { value: ReportActionEnum.USER_BANNED },
    AccountDeactivated: { value: ReportActionEnum.ACCOUNT_DEACTIVATED },
    ReportDuplicate: { value: ReportActionEnum.REPORT_DUPLICATE },
    Escalated: { value: ReportActionEnum.ESCALATED },
    Other: { value: ReportActionEnum.OTHER },
  },
});

//report priority
export const GraphQLReportPriorityEnum = new GraphQLEnumType({
  name: "GraphQLReportPriorityEnum",
  values: {
    LOW: { value: ReportPriorityEnum.LOW },
    MEDIUM: { value: ReportPriorityEnum.MEDIUM },
    HIGH: { value: ReportPriorityEnum.HIGH },
    CRITICAL: { value: ReportPriorityEnum.CRITICAL },
  },
});
