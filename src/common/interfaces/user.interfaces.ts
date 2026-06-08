import type { Types } from "mongoose";
import type {
  DeactivatedReasonEnum,
  ProviderEnum,
  RoleEnum,
  UserStatusEnum,
} from "../enums/user.enums.js";

//fields
export interface IUser {
  email?: string;
  password?: string;
  phone?: string | undefined;
  role: RoleEnum;
  userStatus: UserStatusEnum;
  provider: ProviderEnum;
  verifiedAt?: Date;
  changeCredentialsTime?: Date;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  bannedAt?: Date;
  adminBanner: Types.ObjectId | string;
  banReason?: string;
  banCancelledAt?: Date;
  deactivatedAt?: Date;
  deactivatedReason: DeactivatedReasonEnum;
  reactivatedAt?: Date;
  reportsCount?: number;
  deletedAt?: Date;
  restoredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

//methods
export interface IUserMethod {
  comparePassword: (password: string) => Promise<boolean>;
}
