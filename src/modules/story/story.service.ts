import type { HydratedDocument } from "mongoose";
import { InternalServerError } from "../../common/errors/server.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { StoryRepository } from "../../infra/repository/engagement/story.repository.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import type { GetStoryDto, GetStoryById, UploadStoryDto } from "./story.js";
import type { IStory } from "../../common/interfaces/story.interface.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { NotFoundError } from "../../common/errors/client.errors.js";
import {
  BlockRepository,
  FollowRepository,
  ProfileRepository,
} from "../../infra/repository/index.js";
import { ProfileVisibilityEnum } from "../../common/enums/profile.enums.js";

class StoryService {
  private readonly storyRepository: StoryRepository;
  private readonly blockRepository: BlockRepository;
  private readonly followRepository: FollowRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly redis = redisService;

  private get realtime() {
    return realtimeGateWay;
  }
  constructor() {
    this.storyRepository = new StoryRepository();
    this.blockRepository = new BlockRepository();
    this.followRepository = new FollowRepository();
    this.profileRepository = new ProfileRepository();
  }

  //populate
  private readonly storyPopulateOptions = [
    {
      path: "ownerId",
      select: "_id",
      populate: [{ path: "profile", select: "_id username avatarUrl" }],
    },
    {
      path: "likes.actorId",
      populate: [{ path: "profile", select: "_id username avatarUrl" }],
    },
  ];

  //upload story
  async uploadStory(inputs: UploadStoryDto): Promise<void> {
    const { user, content } = inputs;
    const story = await this.storyRepository.createOne({
      data: {
        ownerId: user._id,
        content,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    if (!story) {
      throw new InternalServerError(
        `Fail to upload this story please try again later`,
      );
    }
    await this.redis.incrementStoryListVersion(user._id);
    const socketIds = await this.redis.getSockets(user._id);
    this.realtime.getIo
      .to(socketIds)
      .emit("upload_story", { userId: user._id, story });

    return;
  }

  //get my story
  async getMyStory(inputs: GetStoryDto): Promise<HydratedDocument<IStory>> {
    const { user, storyId } = inputs;
    const key = this.redis.storyKey(storyId);
    const story = await this.redis.cache({
      key,
      ttl: CacheTTL.STORY,
      fn: () =>
        this.storyRepository.findOne({
          filter: { _id: storyId, ownerId: user._id },
          options: { populate: this.storyPopulateOptions },
        }),
    });
    if (!story) {
      throw new NotFoundError(`Story not found`);
    }

    return story;
  }

  //get story by id
  async getStoryById(inputs: GetStoryById): Promise<HydratedDocument<IStory>> {
    const { user, storyId } = inputs;
    const key = this.redis.storyKey(storyId);
    const story = await this.redis.cache({
      key,
      ttl: CacheTTL.STORY,
      fn: () =>
        this.storyRepository.findOne({
          filter: { _id: storyId },
          options: { populate: this.storyPopulateOptions },
        }),
    });
    if (!story) {
      throw new NotFoundError(`Story not found`);
    }
    if (user._id.toString() === story.ownerId.toString()) {
      return story;
    }
    const ownerId = story.ownerId;
    const [isBlocked, profile, isFollower] = await Promise.all([
      this.blockRepository.findOne({
        filter: {
          $or: [
            { blockerId: user._id, blockedId: ownerId },
            { blockerId: ownerId, blockedId: user._id },
          ],
        },
      }),
      this.profileRepository.findOne({
        filter: { ownerId },
      }),
      this.followRepository.findOne({
        filter: { followerId: user._id, followingId: ownerId },
      }),
    ]);
    if (!profile || isBlocked) {
      throw new NotFoundError(`Story not found`);
    }
    if (!isFollower && profile.visibility === ProfileVisibilityEnum.PRIVATE) {
      throw new NotFoundError(`Story not found`);
    }

    return story;
  }
}

export const storyService = new StoryService();
