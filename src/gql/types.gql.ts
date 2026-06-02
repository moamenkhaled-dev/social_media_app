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
  GraphQLMessageTypeEnum,
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

  //post
  onePostType: GraphQLObjectType = new GraphQLObjectType({
    name: "onePostType",
    fields: () => ({
      _id: { type: GraphQLID },
      authorId: { type: this.oneUserType },
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

  //profile
  oneProfileType = new GraphQLObjectType({
    name: "oneProfileType",
    fields: () => ({
      _id: { type: GraphQLID },
      ownerId: { type: GraphQLID },
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
      profile: { type: this.oneProfileType },
    }),
  });

  //comment
  oneCommentType = new GraphQLObjectType({
    name: "oneCommentType",
    fields: () => ({
      _id: { type: new GraphQLNonNull(GraphQLID) },
      postId: { type: new GraphQLNonNull(GraphQLID) },
      authorId: { type: new GraphQLNonNull(this.oneUserType) },
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
      participants: { type: new GraphQLList(this.oneUserType) },
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
      senderId: { type: this.oneUserType },
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

  //follow user
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
}

export const graphQLTypes = new GraphQLTypes();
