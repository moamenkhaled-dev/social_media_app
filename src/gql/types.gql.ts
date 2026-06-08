import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import {
  GQLGenderEnum,
  GQLPostStatusEnum,
  GQLPostVisibilityEnum,
  GQLProfileVisibilityEnum,
  GQLRelationEnum,
  GraphQLChatTypeEnum,
  GraphQLLanguageEnum,
  GraphQLMessageTypeEnum,
  GraphQLReportActionEnum,
  GraphQLReportPriorityEnum,
  GraphQLReportReasonEnum,
  GraphQLReportStatusEnum,
  GraphQLReportTargetTypeEnum,
  GraphQLShowFollowEnum,
} from "../common/enums/gql.enums.js";

class GraphQLTypes {
  messageType = new GraphQLNonNull(GraphQLString);

  //location
  locationType = new GraphQLObjectType({
    name: "locationType",
    fields: () => ({
      country: { type: GraphQLString },
      city: { type: GraphQLString },
    }),
  });

  //paginate meta data
  onePaginationMetaType = new GraphQLObjectType({
    name: "onePaginationMetaType",
    fields: () => ({
      totalPages: { type: new GraphQLNonNull(GraphQLInt) },
      totalDocs: { type: new GraphQLNonNull(GraphQLInt) },
      currentPage: { type: new GraphQLNonNull(GraphQLInt) },
      limit: { type: new GraphQLNonNull(GraphQLInt) },
      hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
      hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    }),
  });

  //stats
  oneStatsType = new GraphQLObjectType({
    name: "oneStatsType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLString) },
      followersCount: { type: new GraphQLNonNull(GraphQLInt) },
      followingCount: { type: new GraphQLNonNull(GraphQLInt) },
      profileViewsCount: { type: new GraphQLNonNull(GraphQLInt) },
      totalLikesReceived: { type: new GraphQLNonNull(GraphQLInt) },
      totalCommentsReceived: { type: new GraphQLNonNull(GraphQLInt) },
    }),
  });

  //auth
  oneAuthType: GraphQLObjectType = new GraphQLObjectType({
    name: "oneAuthType",
    fields: () => ({
      _id: { type: GraphQLID },
      userEmail: { type: GraphQLString },
    }),
  });

  //notification
  oneNotificationType = new GraphQLObjectType({
    name: "oneNotificationType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      body: { type: new GraphQLNonNull(GraphQLString) },
      notificationType: { type: new GraphQLNonNull(GraphQLString) },
      isRead: { type: GraphQLBoolean },
      createdAt: { type: GraphQLString },
      postId: { type: GraphQLID },
      commentId: { type: GraphQLID },
      messageId: { type: GraphQLID },
      username: { type: GraphQLString },
      avatarUrl: { type: GraphQLString },
    }),
  });

  //author id
  // private oneAuthorType = new GraphQLObjectType({
  //   name: "oneAuthorType",
  //   fields: () => ({
  //     _id: { type: new GraphQLNonNull(GraphQLID) },
  //     username: { type: new GraphQLNonNull(GraphQLString) },
  //     avatarUrl: { type: GraphQLString },
  //   }),
  // });

  private oneAuthorType = new GraphQLObjectType({
    name: "oneAuthorType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      profile: {
        type: new GraphQLObjectType({
          name: "postAuthorProfileType",
          fields: {
            ownerId: { type: new GraphQLNonNull(GraphQLID) },
            username: { type: new GraphQLNonNull(GraphQLID) },
            avatarUrl: { type: GraphQLString },
          },
        }),
      },
    }),
  });

  //post
  onePostType: GraphQLObjectType = new GraphQLObjectType({
    name: "onePostType",
    fields: () => ({
      _id: { type: GraphQLID },
      authorId: { type: this.oneAuthorType },
      content: { type: GraphQLString },
      media: { type: new GraphQLList(GraphQLString) },
      postVisibility: { type: GQLPostVisibilityEnum },
      likesCount: { type: GraphQLInt },
      commentsCount: { type: GraphQLInt },
      sharesCount: { type: GraphQLInt },
      viewsCount: { type: GraphQLInt },
      postStatus: { type: GQLPostStatusEnum },
      createdAt: { type: GraphQLString },
      updatedAt: { type: GraphQLString },
    }),
  });

  //story like
  oneStoryLikeType = new GraphQLObjectType({
    name: "oneStoryLikeType",
    fields: () => ({
      actorId: { type: this.oneAuthorType },
      like: { type: GraphQLString },
    }),
  });

  //story
  oneStoryType = new GraphQLObjectType({
    name: "oneStoryType",
    fields: () => ({
      _id: { type: GraphQLID },
      ownerId: { type: this.oneAuthorType },
      content: { type: GraphQLString },
      media: { type: GraphQLString },
      likes: { type: new GraphQLList(this.oneStoryLikeType) },
      likesCount: { type: new GraphQLNonNull(GraphQLInt) },
      createdAt: { type: GraphQLString },
    }),
  });

  //profile
  oneProfileType = new GraphQLObjectType({
    name: "oneProfileType",
    fields: () => ({
      _id: { type: GraphQLID },
      ownerId: { type: this.profileOwnerType },
      username: { type: GraphQLString },
      joinedAt: { type: GraphQLString },
      avatarUrl: { type: GraphQLString },
      coverUrls: { type: new GraphQLList(GraphQLString) },
      bio: { type: GraphQLString },
      education: { type: GraphQLString },
      website: { type: GraphQLString },
      location: { type: this.locationType },
      gender: { type: GQLGenderEnum },
      DOB: { type: GraphQLString },
      relationship: { type: GQLRelationEnum },
      visibility: { type: GQLProfileVisibilityEnum },
      lastLoginAt: { type: GraphQLString },
    }),
  });

  profileOwnerType = new GraphQLObjectType({
    name: "profileOwnerType",
    fields: () => ({
      email: { type: GraphQLString },
      phone: { type: GraphQLString },
      posts: { type: this.onePostType },
    }),
  });

  //user
  oneUserType = new GraphQLObjectType({
    name: "oneUserType",
    fields: () => ({
      _id: { type: GraphQLID },
      email: { type: GraphQLString },
      phone: { type: GraphQLString },
    }),
  });

  //comment
  oneCommentType = new GraphQLObjectType({
    name: "oneCommentType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      postId: { type: new GraphQLNonNull(GraphQLID) },
      authorId: { type: new GraphQLNonNull(this.oneAuthorType) },
      content: { type: GraphQLString },
      media: { type: new GraphQLList(GraphQLString) },
      likesCount: { type: GraphQLInt },
      repliesCount: { type: GraphQLInt },
      mentions: { type: new GraphQLList(GraphQLString) },
    }),
  });

  //one chat type
  oneChatType = new GraphQLObjectType({
    name: "oneChatType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      participants: { type: new GraphQLList(this.oneAuthorType) },
      type: { type: GraphQLChatTypeEnum },
      lastMessage: { type: GraphQLString },
      groupName: { type: GraphQLString },
      groupImage: { type: GraphQLString },
      roomId: { type: GraphQLString },
      createdAt: { type: GraphQLString },
      updatedAt: { type: GraphQLString },
    }),
  });

  //one message type
  oneMessageType = new GraphQLObjectType({
    name: "oneMessageType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      senderId: { type: this.oneAuthorType },
      type: { type: GraphQLMessageTypeEnum },
      content: { type: GraphQLString },
      attachments: { type: new GraphQLList(GraphQLString) },
      replyToMessageId: { type: GraphQLID },
      isEdited: { type: GraphQLBoolean },
      deletedAt: { type: GraphQLString },
      createdAt: { type: GraphQLString },
      updatedAt: { type: GraphQLString },
    }),
  });

  //followers list
  oneFollowersListType = new GraphQLObjectType({
    name: "oneFollowersListType",
    fields: () => ({
      followerId: { type: GraphQLID },
      follower: {
        type: new GraphQLObjectType({
          name: "followerType",
          fields: {
            username: { type: GraphQLString },
            avatarUrl: { type: GraphQLString },
          },
        }),
      },
    }),
  });

  //following list
  oneFollowingListType = new GraphQLObjectType({
    name: "oneFollowingListType",
    fields: () => ({
      followingId: { type: GraphQLID },
      following: {
        type: new GraphQLObjectType({
          name: "followingType",
          fields: {
            username: { type: GraphQLString },
            avatarUrl: { type: GraphQLString },
          },
        }),
      },
    }),
  });

  //follow requests list
  oneFollowRequestsListType = new GraphQLObjectType({
    name: "oneFollowRequestsListType",
    fields: () => ({
      requesterId: { type: GraphQLID },
      requester: {
        type: new GraphQLObjectType({
          name: "requesterType",
          fields: {
            username: { type: GraphQLString },
            avatarUrl: { type: GraphQLString },
          },
        }),
      },
    }),
  });

  //privacy type
  privacyType = new GraphQLObjectType({
    name: "oneSettingsPrivacyType",
    fields: () => ({
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
    }),
  });
  //one settings type
  oneSettingsType = new GraphQLObjectType({
    name: "oneSettingsType",
    fields: {
      _id: { type: new GraphQLNonNull(GraphQLID) },
      ownerId: { type: new GraphQLNonNull(GraphQLID) },
      privacy: { type: this.privacyType },
      language: { type: GraphQLLanguageEnum },
      showInSearch: { type: GraphQLBoolean },
      showInRecommendations: { type: GraphQLBoolean },
      allowNotifications: { type: GraphQLBoolean },
      allowGroupAdding: { type: GraphQLBoolean },
    },
  });

  //one report type
  oneReportType = new GraphQLObjectType({
    name: "oneReportType",
    fields: {
      _id: { type: new GraphQLNonNull(GraphQLID) },
      reporterId: { type: new GraphQLNonNull(GraphQLString) },
      targetType: { type: new GraphQLNonNull(GraphQLReportTargetTypeEnum) },
      targetId: { type: new GraphQLNonNull(GraphQLString) },
      reason: { type: new GraphQLNonNull(GraphQLReportReasonEnum) },
      customReason: { type: GraphQLString },
      snapshot: { type: GraphQLString },
      createdAt: { type: GraphQLString },
      updatedAt: { type: GraphQLString },
    },
  });

  //one moderation case type
  oneModerationCaseType = new GraphQLObjectType({
    name: "oneModerationCaseType",
    fields: {
      _id: { type: new GraphQLNonNull(GraphQLID) },
      targetId: { type: new GraphQLNonNull(GraphQLID) },
      targetType: { type: new GraphQLNonNull(GraphQLReportTargetTypeEnum) },
      reportsCount: { type: GraphQLInt },
      priority: { type: new GraphQLNonNull(GraphQLReportPriorityEnum) },
      status: { type: new GraphQLNonNull(GraphQLReportStatusEnum) },
      actionTaken: { type: GraphQLReportActionEnum },
      lastReason: { type: GraphQLString },
      actorId: { type: GraphQLID },
      reviewedAt: { type: GraphQLString },
      reviewedBy: { type: new GraphQLList(GraphQLID) },
      createdAt: { type: GraphQLString },
      updatedAt: { type: GraphQLString },
    },
  });
}

export const graphQLTypes = new GraphQLTypes();
