import { model, Schema, Types } from "mongoose";
import type { IFollow } from "../../../common/interfaces/follow.interface.js";
import { FollowStatusEnum } from "../../../common/enums/follow.enums.js";

const followSchema = new Schema<IFollow>(
  {
    followerId: { type: Types.ObjectId, ref: "User", required: true },
    followingId: { type: Types.ObjectId, ref: "User", required: true },
    followStatus: {
      type: String,
      enum: FollowStatusEnum,
      default: FollowStatusEnum.ACCEPTED,
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

//indexes
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

//hooks
followSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "countDocuments"],
  function () {
    const filter = this.getFilter();
    // bypass hook
    if (filter.all === true) {
      delete filter.all;
      this.setQuery(filter);
      return;
    }
    // deleted follows
    // if (filter.unFollowed === true) {
    //   delete filter.unFollowed;
    //   this.setQuery({
    //     ...filter,
    //     followStatus: FollowStatusEnum.DELETED,
    //   });
    //   return;
    // }
    // pending requests
    if (filter.requested === true) {
      delete filter.requested;
      this.setQuery({
        ...filter,
        followStatus: FollowStatusEnum.REQUESTED,
      });
      return;
    }
    // rejected requests
    // if (filter.rejected === true) {
    //   delete filter.rejected;
    //   this.setQuery({
    //     ...filter,
    //     followStatus: FollowStatusEnum.REJECTED,
    //   });
    //   return;
    // }
    // default behavior
    this.setQuery({
      ...filter,
      followStatus: FollowStatusEnum.ACCEPTED,
    });
  },
);

//export model
export const Follow = model<IFollow>("Follow", followSchema);
