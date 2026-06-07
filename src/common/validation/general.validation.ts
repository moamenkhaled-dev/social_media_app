import { Types } from "mongoose";
import { ProviderEnum, RoleEnum, UserStatusEnum } from "../enums/user.enums.js";
import {
  GenderEnum,
  LanguageEnum,
  ProfileVisibilityEnum,
} from "../enums/profile.enums.js";
import z from "zod";
import { FollowStatusEnum } from "../enums/follow.enums.js";
import {
  ReportActionEnum,
  ReportPriorityEnum,
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "../enums/report.enums.js";
import type { CountryCode } from "libphonenumber-js/max";
import { getCountries } from "libphonenumber-js/max";
import {
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../enums/notification.enums.js";
import { toObjectId } from "../objectId.js";
import { LogoutFlagEnum } from "../enums/security.enums.js";
import {
  MediaTypeEnum,
  PostStatusEnum,
  PostVisibilityEnum,
} from "../enums/post.enums.js";
import { Readable } from "node:stream";

export const generalValidationFields = {
  id: z
    .string()
    .refine((v) => Types.ObjectId.isValid(v), { error: "invalid id" })
    .transform((v) => toObjectId(v)),
  date: z.date(),
  string: (min: number, max: number) => z.string().min(min).max(max),
  email: z.email(),
  password: z.string().min(8).max(100),
  phone: z.string(),
  role: z.enum(RoleEnum),
  userStatus: z.enum(UserStatusEnum),
  provider: z.enum(ProviderEnum),
  gender: z.enum(GenderEnum),
  postStatus: z.enum(PostStatusEnum),
  media: z.array(
    z.object({
      url: z.url(),
      postMediaType: z.enum(MediaTypeEnum),
    }),
  ),
  profileVisibility: z.enum(ProfileVisibilityEnum),
  postVisibility: z.enum(PostVisibilityEnum),
  arrayIDs: z.array(
    z
      .string()
      .refine((v) => Types.ObjectId.isValid(v), { error: "invalid id" }),
  ),
  arrayStrings: z.array(z.string()),
  url: z.url(),
  mimeType: z.string(),
  size: z.number().max(2 * 1024 * 1024),
  duration: z.number(),
  followStatus: z.enum(FollowStatusEnum),
  notificationType: z.enum(NotificationTypeEnum),
  notificationTargetType: z.enum(NotificationTargetTypeEnum),
  pushStatus: z.enum(PushStatusEnum).default(PushStatusEnum.PENDING),
  reportTargetType: z.enum(ReportTargetTypeEnum),
  reason: z.enum(ReportReasonEnum),
  priority: z.enum(ReportPriorityEnum),
  reportAction: z.enum(ReportActionEnum),
  reportStatus: z.enum(ReportStatusEnum),
  customReason: z.string(),
  description: z.string(),
  allowNotifications: z.boolean(),
  showInSearch: z.boolean(),
  showInRecommendations: z.boolean(),
  language: z.enum(LanguageEnum),
  followersCount: z.number(),
  followingCount: z.number(),
  profileViewsCount: z.number(),
  totalLikesReceived: z.number(),
  totalCommentsReceived: z.number(),
  nullString: z.string(),
  countryCode: z.custom<CountryCode>(
    (val) => {
      return (
        typeof val === "string" && getCountries().includes(val as CountryCode)
      );
    },
    {
      message: "invalid country code",
    },
  ),
  otp: z.string().length(6),
  logoutFlag: z.enum(LogoutFlagEnum),

  file: (allowedMimeTypes: string[], maxSizeMB = 10) =>
    z.object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string().refine((v) => allowedMimeTypes.includes(v), {
        message: `Allowed types: ${allowedMimeTypes.join(", ")}`,
      }),
      finalPath: z.string().optional(),
      size: z
        .number()
        .positive()
        .max(maxSizeMB * 1024 * 1024, `Max size is ${maxSizeMB}MB`),
      destination: z.string().optional(),
      filename: z.string().optional(),
      path: z.string().optional(),
      buffer: z.instanceof(Buffer).optional(),
      stream: z.instanceof(Readable).optional(),
    }) as unknown as z.ZodType<Express.Multer.File>,

  files: (allowedMimeTypes: string[], maxSizeMB = 10, maxCount = 10) =>
    z
      .array(
        z.object({
          fieldname: z.string(),
          originalname: z.string(),
          encoding: z.string(),
          mimetype: z.string().refine((v) => allowedMimeTypes.includes(v), {
            message: `Allowed types: ${allowedMimeTypes.join(", ")}`,
          }),
          finalPath: z.string().optional(),
          size: z
            .number()
            .positive()
            .max(maxSizeMB * 1024 * 1024, `Max size is ${maxSizeMB}MB`),
          destination: z.string().optional(),
          filename: z.string().optional(),
          path: z.string().optional(),
          buffer: z.instanceof(Buffer).optional(),
          stream: z.instanceof(Readable).optional(),
        }),
      )
      .max(maxCount, `Max ${maxCount} files allowed`) as unknown as z.ZodType<
      Array<Express.Multer.File>
    >,
};
