import {
  PostStatusEnum,
  PostVisibilityEnum,
} from "../../common/enums/post.enums.js";
import { PostRepository } from "../../infra/repository/engagement/post.repository.js";
import type {
  CreatePostDto,
  GetPostDto,
  PostsListDto,
  UpdatePostDto,
} from "./post.js";
import {
  FollowRepository,
  NotificationRepository,
  ProfileRepository,
  UserRepository,
  type PaginateType,
} from "../../infra/repository/index.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { randomUUID } from "node:crypto";
import { s3Queue } from "../../infra/queue/queues/s3.queue.js";
import { JobEnum } from "../../common/enums/job.enums.js";

import type {
  ICreatePostResponse,
  IGetPostByIdResponse,
  IPostsListResponse,
} from "./post.entity.js";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import { toObjectId } from "../../common/objectId.js";
import { ProfileVisibilityEnum } from "../../common/enums/profile.enums.js";
import type { IPost } from "../../common/interfaces/post.interfaces.js";
import { PaginateDefault } from "../../common/constants/paginate.constants.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { PostContextEnum } from "../../common/enums/redis.enums.js";
import {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../../common/enums/notification.enums.js";
import { notificationService } from "../notification/notification.service.js";

class PostService {
  private readonly postRepository: PostRepository;
  private readonly userRepository: UserRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly followRepository: FollowRepository;
  private readonly notification = notificationService;
  private readonly redis = redisService;
  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.profileRepository = new ProfileRepository();
    this.followRepository = new FollowRepository();
  }

  //populate
  private readonly postPopulateOptions = [
    {
      path: "authorId",
      select: "_id",
      populate: [{ path: "profile", select: "_id username avatarUrl" }],
    },
    {
      path: "comments",
      select: "content media",
      populate: [
        {
          path: "authorId",
          select: "_id",
          populate: [{ path: "profile", select: "_id username avatarUrl" }],
        },
      ],
    },
  ];
  //projection
  private readonly postProjection =
    "content media commentsCount sharesCount likesCount viewsCount createdAt";

  //create post
  async createPost(inputs: CreatePostDto): Promise<ICreatePostResponse> {
    const { user, content, files, postVisibility, tags } = inputs;
    const [profile, users] = await Promise.all([
      this.profileRepository.findOne({
        filter: { ownerId: user._id },
      }),
      tags && tags.length
        ? this.userRepository.find({
            filter: { _id: { $in: tags } },
          })
        : Promise.resolve([]),
    ]);
    if (!profile) {
      throw new NotFoundError(`Profile not found`);
    }
    if (tags && users.length !== tags.length) {
      throw new NotFoundError(`Fail to find mention accounts`);
    }
    const folderId = randomUUID();
    const post = await this.postRepository.createOne({
      data: {
        authorId: user._id,
        content,
        media: [],
        postVisibility,
        tags: tags || [],
        folderId,
      },
    });
    if (!post) {
      throw new BadRequestError(`Fail to upload this post please try again`);
    }
    if (files && files.length) {
      void s3Queue.add(
        JobEnum.UPLOAD_POST_MEDIA,
        { userId: user._id, files, folderId: post.folderId },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    } else {
      post.postStatus = PostStatusEnum.PUBLISHED;
      await post.save();
    }
    const notificationDB = await this.notification.createOneNotification({
      actorId: user._id,
      notificationType: NotificationTypeEnum.SYSTEM,
      notificationTargetType: NotificationTargetTypeEnum.POST,
      notificationTargetId: post._id,
      title: `New post`,
      body: `${profile.username} upload new post`,
      pushStatus: PushStatusEnum.PENDING,
    });
    if (tags && tags.length && post.postStatus === PostStatusEnum.PUBLISHED) {
      void notificationQueue.add(
        JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
        {
          userIds: tags,
          title: `New Post`,
          body: JSON.stringify({
            message: `${profile.username} Upload new post`,
            userId: user._id,
            postId: post._id,
            notificationId: notificationDB._id,
          }),
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    }
    void this.redis.incrementUserVersion(user._id);
    void this.redis.incrementPostVersion({ userId: user._id });

    return {
      message: `Post processing started`,
      userId: user._id,
      postId: post._id,
      status: post.postStatus,
    };
  }

  //update post
  async updatePost(inputs: UpdatePostDto): Promise<ICreatePostResponse> {
    const {
      user,
      postId,
      content,
      files,
      removeFiles,
      tags,
      removeTags,
      postVisibility,
    } = inputs;
    const [users, post, profile] = await Promise.all([
      // users
      tags?.length
        ? this.userRepository.find({ filter: { _id: { $in: tags } } })
        : Promise.resolve([]),
      // post
      this.postRepository.findOne({
        filter: { _id: postId, authorId: user._id },
      }),
      // profile
      tags?.length
        ? this.profileRepository.findOne({
            filter: { ownerId: user._id },
            projection: "username",
          })
        : Promise.resolve(null),
    ]);
    if ((tags && tags.length && !profile) || !post) {
      throw new NotFoundError(
        `Something went wrong may be post not found or you don't have profile`,
      );
    }
    if (tags && users.length !== tags.length) {
      throw new NotFoundError(`Fail to find mention accounts`);
    }
    const updatePost = await this.postRepository.findOneAndUpdate({
      filter: { _id: postId, authorId: user._id },
      update: [
        {
          $set: {
            content: content || post.content,
            postVisibility: postVisibility || post.postVisibility,
            tags: {
              $setUnion: [
                {
                  $setDifference: [
                    { $ifNull: ["$tags", []] },
                    removeTags?.map((tag) => toObjectId(tag)) ?? [],
                  ],
                },
                { $ifNull: [tags ?? null, []] },
              ],
            },
          },
        },
      ],
    });
    if (!updatePost) {
      throw new NotFoundError(`Post not found`);
    }
    if ((files && files.length) || (removeFiles && removeFiles.length)) {
      void s3Queue.add(
        JobEnum.UPDATE_POST_MEDIA,
        {
          userId: user._id,
          postId: post._id,
          folderId: post.folderId,
          files,
          removeFiles,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    }
    const notificationDB = await this.notification.createOneNotification({
      recipientId: user._id,
      actorId: user._id,
      notificationType: NotificationTypeEnum.SYSTEM,
      notificationTargetType: NotificationTargetTypeEnum.POST,
      notificationTargetId: post._id,
      title: `New post`,
      body: `${profile?.username} upload new post`,
      pushStatus: PushStatusEnum.PENDING,
    });
    if (tags && tags.length) {
      void notificationQueue.add(
        JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
        {
          userIds: tags,
          title: `New post`,
          body: JSON.stringify({
            message: `${profile?.username} upload new post`,
            userId: user._id,
            postId: post._id,
          }),
          notificationId: notificationDB._id,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    }
    void this.redis.incrementUserVersion(user._id);
    void this.redis.incrementPostVersion({ userId: user._id });
    void this.redis.incrementPostVersion({ userId: user._id, postId });

    return {
      message: `Post processing started`,
      userId: user._id,
      postId: updatePost._id,
      status: updatePost.postStatus,
    };
  }

  //posts list
  async postsList(inputs: PostsListDto): Promise<IPostsListResponse> {
    const { user, targetUserId, page, limit, search } = inputs;
    const safePage = page ?? PaginateDefault.PAGE;
    const safeLimit = limit ?? PaginateDefault.LIMIT;
    const safeSearch = search ?? PaginateDefault.SEARCH;
    const ttl = CacheTTL.POSTS_LIST;
    const version = await this.redis.getPostVersion({ userId: targetUserId });
    if (user._id.equals(targetUserId)) {
      const key = this.redis.postsListKey({
        targetUserId,
        page: safePage,
        limit: safeLimit,
        search: safeSearch,
        context: PostContextEnum.OWNER,
        version,
      });
      const posts = await this.redis.cache<PaginateType<IPost>>({
        key,
        ttl,
        fn: () =>
          this.postRepository.paginate({
            filter: {
              authorId: user._id,
              ...(search && { content: { $regex: search, $options: "i" } }),
            },
            options: { populate: this.postPopulateOptions },
            page: safePage,
            limit: safeLimit,
          }),
      });
      return { message: "Success", posts };
    }
    const [profile, isFollower] = await Promise.all([
      this.profileRepository.findOne({ filter: { ownerId: targetUserId } }),
      this.followRepository.findOne({
        filter: { followerId: user._id, followingId: targetUserId },
      }),
    ]);
    if (!profile) throw new NotFoundError("Profile not found");
    if (isFollower) {
      const key = this.redis.postsListKey({
        targetUserId,
        page: safePage,
        limit: safeLimit,
        search: safeSearch,
        context: PostContextEnum.FOLLOWER,
        version,
      });
      const posts = await this.redis.cache<PaginateType<IPost>>({
        key,
        ttl,
        fn: () =>
          this.postRepository.paginate({
            filter: {
              authorId: targetUserId,
              postVisibility: { $ne: PostVisibilityEnum.PRIVATE },
            },
            projection: this.postProjection,
            options: { populate: this.postPopulateOptions },
            page: safePage,
            limit: safeLimit,
          }),
      });

      return { message: "Success", posts };
    }
    if (profile.visibility === ProfileVisibilityEnum.PUBLIC) {
      const key = this.redis.postsListKey({
        targetUserId,
        page: safePage,
        limit: safeLimit,
        search: safeSearch,
        context: PostContextEnum.PUBLIC,
        version,
      });
      const posts = await this.redis.cache<PaginateType<IPost>>({
        key,
        ttl,
        fn: () =>
          this.postRepository.paginate({
            filter: {
              authorId: targetUserId,
              postVisibility: PostVisibilityEnum.PUBLIC,
            },
            projection: this.postProjection,
            options: { populate: this.postPopulateOptions },
            page: safePage,
            limit: safeLimit,
          }),
      });

      return { message: "Success", posts };
    }

    return {
      message: "You are not authorized to see any posts",
      posts: {
        data: [],
        meta: {
          totalPages: 0,
          totalDocs: 0,
          currentPage: safePage,
          limit: safeLimit,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    };
  }

  //get post by id
  async getPostById(inputs: GetPostDto): Promise<IGetPostByIdResponse> {
    const { user, targetUserId, postId } = inputs;
    const version = await this.redis.getPostVersion({
      userId: targetUserId,
      postId,
    });
    const ttl = CacheTTL.POST;
    if (user._id.equals(targetUserId)) {
      const key = this.redis.postKey({
        userId: targetUserId,
        postId,
        context: PostContextEnum.OWNER,
        version,
      });
      const post = await this.redis.cache({
        key,
        ttl: CacheTTL.POST,
        fn: () =>
          this.postRepository.findOne({
            filter: { _id: postId, authorId: targetUserId },
            options: { populate: this.postPopulateOptions },
          }),
      });
      if (!post) {
        throw new NotFoundError(`Post not found`);
      }

      return { message: `Success`, post };
    }
    const [profile, isFollower] = await Promise.all([
      //profile
      this.profileRepository.findOne({ filter: { ownerId: targetUserId } }),
      //isFollower
      this.followRepository.findOne({
        filter: { followerId: user._id, followingId: user._id },
      }),
    ]);
    if (!profile) {
      throw new NotFoundError(`Profile not found`);
    }
    if (!isFollower && profile.visibility === ProfileVisibilityEnum.PUBLIC) {
      const key = this.redis.postKey({
        userId: targetUserId,
        postId,
        context: PostContextEnum.FOLLOWER,
        version,
      });
      const post = await this.redis.cache({
        key,
        ttl,
        fn: () =>
          this.postRepository.findOne({
            filter: {
              _id: postId,
              authorId: targetUserId,
              postVisibility: PostVisibilityEnum.PUBLIC,
            },
            projection: this.postProjection,
            options: { populate: this.postPopulateOptions },
          }),
      });
      if (!post) {
        throw new NotFoundError(`Post not found`);
      }

      return { message: `Success`, post };
    }
    if (isFollower) {
      const key = this.redis.postKey({
        userId: targetUserId,
        postId,
        context: PostContextEnum.PUBLIC,
        version,
      });
      const post = await this.redis.cache({
        key,
        ttl,
        fn: () =>
          this.postRepository.findOne({
            filter: {
              _id: postId,
              authorId: targetUserId,
              postVisibility: { $ne: PostVisibilityEnum.PRIVATE },
            },
            projection: this.postProjection,
            options: { populate: this.postPopulateOptions },
          }),
      });
      if (!post) {
        throw new NotFoundError(`Post not found`);
      }

      return { message: `Success`, post };
    }

    return { message: `You are not authorize to view this post` };
  }
}

export const postService = new PostService();
