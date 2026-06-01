import type { HydratedDocument } from "mongoose";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { JobEnum } from "../../common/enums/job.enums.js";

import {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../../common/enums/notification.enums.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import type { IComment } from "../../common/interfaces/comment.interfaces.js";
import type { ISendMultipleNotificationsData } from "../../common/interfaces/notification.interfaces.js";
import { toObjectId } from "../../common/objectId.js";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import { s3Queue } from "../../infra/queue/queues/s3.queue.js";
import { redisService } from "../../common/services/redis.service.js";
import {
  CommentRepository,
  PostRepository,
  ProfileRepository,
  UserRepository,
  type PaginateMetaType,
} from "../../infra/repository/index.js";
import { notificationService } from "../notification/notification.service.js";
import type {
  CommentsListDto,
  CreateCommentDto,
  GetCommentDto,
  UpdateCommentDto,
} from "./comment.js";
import type { ICommentsListResponse } from "./comment.entity.js";

class CommentService {
  private readonly commentRepository: CommentRepository;
  private readonly postRepository: PostRepository;
  private readonly userRepository: UserRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly notification = notificationService;
  private readonly redis = redisService;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
    this.profileRepository = new ProfileRepository();
  }

  //create comment
  async createComment(inputs: CreateCommentDto): Promise<IComment> {
    const { user, postId, parentCommentId, content, files, mentions } = inputs;
    const [profile, users, post, parentComment] = await Promise.all([
      //profile
      mentions && mentions.length
        ? this.profileRepository.findOne({ filter: { ownerId: user._id } })
        : Promise.resolve(null),
      //users
      mentions && mentions.length
        ? this.userRepository.find({ filter: { _id: { $in: mentions } } })
        : Promise.resolve([]),
      //post
      this.postRepository.findOne({ filter: { _id: postId } }),
      //parentComment
      parentCommentId
        ? this.commentRepository.findOne({
            filter: { _id: parentCommentId, postId },
          })
        : Promise.resolve(null),
    ]);
    if (!post || (parentCommentId && !parentComment)) {
      throw new NotFoundError(
        `Something went wrong may be post or comment not found`,
      );
    }
    if (mentions && mentions.length && users.length !== mentions.length) {
      throw new NotFoundError(`Fail to find mention accounts`);
    }
    const comment = await this.commentRepository.createOne({
      data: {
        authorId: user._id,
        postId,
        media: [],
        ...(parentCommentId !== undefined && { parentCommentId }),
        content,
        mentions: mentions?.map((mention) => toObjectId(mention)) || [],
        folderId: post.folderId as string,
      },
    });
    if (!comment) {
      throw new BadRequestError(`Can't upload this comment`);
    }
    if (files && files.length) {
      void s3Queue.add(
        JobEnum.UPLOAD_COMMENT_MEDIA,
        {
          commentId: comment._id,
          authorId: user._id,
          postId,
          parentCommentId,
          folderId: post.folderId,
          files,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
        },
      );
    }
    const comments = await this.commentRepository.find({
      filter: { postId },
      projection: "authorId mentions",
    });
    if (mentions && mentions.length) {
      const notificationDB = await this.notification.createOneNotification({
        actorId: user._id,
        notificationType: NotificationTypeEnum.COMMENT,
        notificationTargetType: NotificationTargetTypeEnum.COMMENT,
        notificationTargetId: comment._id,
        title: `New Comment`,
        body: `${profile?.username} has comment on post ${post.content}`,
        postId: post._id,
        commentId: comment._id,
        username: profile?.username,
        avatarUrl: profile?.avatarUrl,
        pushStatus: PushStatusEnum.PENDING,
      });
      void notificationQueue.add(
        JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
        {
          userIds: [
            ...mentions,
            ...(post.tags || []),
            ...comments.map((c) => c.authorId),
            ...comments.map((c) => c.mentions).flat(),
          ],
          title: `New Comment`,
          body: JSON.stringify({
            message: `${profile?.username} has comment on post ${post.content}`,
            notificationId: notificationDB._id,
            userId: user._id,
            postId,
            commentId: comment._id,
          }),
          notificationId: notificationDB._id,
        },
        { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
      );
    }
    void this.redis.incrementPostVersion({ userId: user._id, postId });
    void this.redis.incrementCommentVersion(comment._id);
    void this.redis.incrementCommentVersion("List");

    return comment;
  }

  //update comment
  async updateComment(inputs: UpdateCommentDto): Promise<IComment> {
    const {
      user,
      postId,
      commentId,
      content,
      files,
      mentions,
      removeFiles,
      removeMentions,
    } = inputs;
    console.log({ removeMentions });

    const [post, comment, mentionAccounts, profile] = await Promise.all([
      //post
      this.postRepository.findOne({ filter: { _id: postId } }),
      //comment
      this.commentRepository.findOne({
        filter: { _id: commentId, postId, authorId: user._id },
      }),
      //mentionAccounts
      mentions?.length
        ? this.userRepository.find({ filter: { _id: { $in: mentions } } })
        : Promise.resolve([]),
      //profile
      mentions && mentions.length
        ? this.profileRepository.findOne({ filter: { ownerId: user._id } })
        : Promise.resolve(null),
    ]);
    if (!post || !comment || (mentions && !profile)) {
      throw new NotFoundError(
        "Something went wrong may be post or comment not found",
      );
    }
    if (mentions && mentions.length !== mentionAccounts.length) {
      throw new NotFoundError("Fail to find mention accounts");
    }
    if (
      !content &&
      !post.content &&
      !files &&
      removeFiles?.length === post.media?.length
    ) {
      throw new BadRequestError(`Post can't be empty`);
    }
    const updateComment = await this.commentRepository.findOneAndUpdate({
      filter: { _id: commentId, postId, authorId: user._id },
      update: [
        {
          $set: {
            content: content || comment.content,
            mentions: {
              $setUnion: [
                {
                  $setDifference: [
                    {
                      $map: {
                        input: { $ifNull: ["$mentions", []] },
                        as: "m",
                        in: { $toString: "$$m" },
                      },
                    },
                    removeMentions?.map((m) => m.toString()) ?? [],
                  ],
                },
                mentions?.map((m) => m.toString()) ?? [],
              ],
            },
          },
        },
        {
          $set: {
            mentions: {
              $map: {
                input: "$mentions",
                as: "m",
                in: { $toObjectId: "$$m" },
              },
            },
          },
        },
      ],
    });
    if (!updateComment) {
      throw new BadRequestError(`Fail to update this comment`);
    }
    if ((files && files.length) || (removeFiles && removeFiles.length)) {
      void s3Queue.add(
        JobEnum.UPDATE_COMMENT_MEDIA,
        {
          userId: user._id,
          postId,
          commentId,
          files,
          removeFiles,
          folderId: comment.folderId,
        },
        { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
      );
    }
    if (mentions && mentions.length) {
      const notificationDB = await this.notification.createOneNotification({
        actorId: user._id,
        notificationTargetType: NotificationTargetTypeEnum.COMMENT,
        notificationType: NotificationTypeEnum.COMMENT,
        notificationTargetId: comment._id,
        title: `New Comment`,
        body: `${profile?.username} mention you in a comment`,
        postId,
        commentId,
        username: profile?.username,
        avatarUrl: profile?.avatarUrl,
      });
      if (notificationDB) {
        const data: ISendMultipleNotificationsData = {
          userIds: mentions,
          notificationId: notificationDB._id,
          title: `New Comment`,
          body: JSON.stringify({
            message: `${profile?.username} mention you in a comment`,
            postId,
            commentId,
            notificationId: notificationDB._id,
            userId: user._id,
          }),
        };
        void notificationQueue.add(
          JobEnum.SEND_MULTIPLE_NOTIFICATIONS,
          { ...data },
          { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
        );
      }
    }
    void this.redis.incrementPostVersion({ userId: user._id, postId });
    void this.redis.incrementCommentVersion(commentId);
    void this.redis.incrementCommentVersion("List");

    return updateComment;
  }

  //get comment
  async getComment(inputs: GetCommentDto): Promise<IComment> {
    const { commentId } = inputs;
    const version = await this.redis.getCommentVersion(commentId);
    const key = this.redis.commentKey({ commentId, version });
    const comment = await this.redis.cache({
      key,
      ttl: CacheTTL.COMMENT,
      fn: () =>
        this.commentRepository.findOne({
          filter: { _id: commentId },
          options: {
            populate: [
              {
                path: "authorId",
                populate: [{ path: "profile", select: "username avatarUrl" }],
              },
            ],
          },
        }),
    });
    if (!comment) {
      throw new NotFoundError(`Comment not found`);
    }

    return comment;
  }

  //comments list of post
  async commentsListOfPost(
    inputs: CommentsListDto,
  ): Promise<ICommentsListResponse | null> {
    const { postId, page, limit } = inputs;
    const version = await this.redis.getCommentVersion("List");
    const key = this.redis.commentsListKey({
      postId,
      page: page as number,
      limit: limit as number,
      version,
    });
    const comments = await this.redis.cache({
      key,
      ttl: CacheTTL.COMMENTS_LIST,
      fn: () =>
        this.commentRepository.paginate({
          filter: { postId },
          page: page as number,
          limit: limit as number,
          options: {
            populate: [
              {
                path: `authorId`,
                populate: [{ path: `profile`, select: `username avatarUrl` }],
              },
            ],
          },
        }),
    });

    return comments;
  }
}

export const commentService = new CommentService();
