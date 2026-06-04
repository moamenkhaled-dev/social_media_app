import type { Types } from "mongoose";
import { redisService } from "../../../common/services/redis.service.js";
import { realtimeGateWay } from "../../../modules/realtime/realtime.gateway.js";
import type { IBlockSocialProcessData } from "../../../common/interfaces/block.interface.js";

class SocialProcess {
  private readonly redis = redisService;
  private get realtime() {
    return realtimeGateWay;
  }

  //block
  async block({
    blockerId,
    blockedId,
  }: IBlockSocialProcessData): Promise<void> {
    await Promise.all([
      this.redis.incrementBlockListVersion(blockerId),
      this.redis.incrementFollowersVersion(blockerId),
      this.redis.incrementFollowingVersion(blockerId),
      this.redis.incrementFollowersVersion(blockedId),
      this.redis.incrementFollowingVersion(blockedId),
    ]);
    const [userSocketIds, targetSocketIds] = await Promise.all([
      this.redis.getSockets(blockerId),
      this.redis.getSockets(blockedId),
    ]);
    this.realtime.getIo
      .to(userSocketIds)
      .emit("block_user", { blockerId: blockerId, blockedId: blockedId });
    this.realtime.getIo.to(targetSocketIds).emit("blocked_by_user", {
      blockerId: blockerId,
      blockedId: blockedId,
    });
  }

  //follow

  //un follow
}

export const socialProcess = new SocialProcess();
