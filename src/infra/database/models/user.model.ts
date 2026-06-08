import { model, Model, Schema, Types } from "mongoose";

import type {
  IUser,
  IUserMethod,
} from "../../../common/interfaces/user.interfaces.js";
import {
  DeactivatedReasonEnum,
  ProviderEnum,
  RoleEnum,
  UserStatusEnum,
} from "../../../common/enums/user.enums.js";
import { BadRequestError } from "../../../common/errors/client.errors.js";
import { modelHelper } from "./helperModel.js";
import { securityService } from "../../../common/services/security.service.js";
import { Comment } from "./comment.model.js";

const userSchema = new Schema<IUser, Model<IUser, any, IUserMethod>>(
  {
    email: { type: String, lowercase: true, unique: true, required: true },
    password: {
      type: String,
      required: function (this) {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    phone: String,
    role: { type: String, enum: RoleEnum, default: RoleEnum.USER },
    userStatus: {
      type: String,
      enum: UserStatusEnum,
      default: UserStatusEnum.ACTIVE,
    },
    provider: {
      type: String,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
    verifiedAt: Date,
    changeCredentialsTime: Date,
    lastLoginAt: Date,
    lastSeenAt: Date,
    bannedAt: Date,
    banReason: { type: String, maxlength: 50 },
    adminBanner: { type: Types.ObjectId, ref: "User" },
    banCancelledAt: Date,
    reportsCount: { type: Number, default: 0 },
    deactivatedAt: Date,
    deactivatedReason: {
      type: String,
      enum: DeactivatedReasonEnum,
      required: function (this) {
        return !!this.deactivatedAt;
      },
    },
    reactivatedAt: Date,
    deletedAt: Date,
    restoredAt: Date,
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

//profile
userSchema.virtual("profile", {
  localField: "_id",
  foreignField: "ownerId",
  ref: "Profile",
  justOne: true,
});
//comments
userSchema.virtual("comments", {
  localField: "_id",
  foreignField: "authorId",
  ref: "Comment",
  justOne: true,
});
//relation
userSchema.virtual("posts", {
  localField: "_id",
  foreignField: "authorId",
  ref: "Post",
  justOne: true,
});

//indexes

//before validate
userSchema.pre("validate", function () {
  if (this.password && this.provider === ProviderEnum.GOOGLE) {
    throw new BadRequestError("Google account can't has password");
  }
});
//before save
userSchema.pre("save", async function () {
  if (this.password && this.isModified("password")) {
    this.password = await securityService.hash({ data: this.password });
  }
});

//query middlewares
userSchema.pre(["find", "findOne"], function () {
  modelHelper.query(this);
});
userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function () {
  modelHelper.query(this);
  modelHelper.update({ update: this.getUpdate(), that: this });
});
userSchema.pre(["findOneAndDelete", "deleteOne", "deleteMany"], function () {
  modelHelper.query(this);
});

//methods
userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return await securityService.compare({
    data: password,
    encrypted: this.password,
  });
};

//export model
export const User = model<IUser, Model<IUser, any, IUserMethod>>(
  "User",
  userSchema,
);
