import type { RedisClientType, SetOptions } from "@redis/client";
import { createClient } from "redis";
import { REDIS_URI } from "../../config/config.js";
import type { Types } from "mongoose";
import { EmailEnum } from "../enums/security.enums.js";
import { PaginateDefault } from "../constants/paginate.constants.js";
import { PostContextEnum } from "../enums/redis.enums.js";

export type OtpKeyType = { email: string; subject?: EmailEnum };
export type CacheUserPayLoadType = {
  id: Types.ObjectId | string;
  version: number;
};

class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: REDIS_URI });
    this.eventHandler();
  }

  //Connection
  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }
  private eventHandler() {
    this.client.on("connect", () =>
      console.log("Redis_DB Connected Successfully"),
    );
    this.client.on("error", () => console.log("Redis_DB Connection Failed"));
  }

  //Key Builders
  baseRevokeTokenKey(userId: Types.ObjectId): string {
    return `Auth::Revoke::${userId}`;
  }
  revokeTokenKey({
    userId,
    jti,
  }: {
    userId: Types.ObjectId;
    jti: string;
  }): string {
    return `${this.baseRevokeTokenKey(userId)}::${jti}`;
  }
  userRateLimitKey({
    userId,
    path,
  }: {
    userId: Types.ObjectId | string;
    path: string;
  }): string {
    return `Auth::RateLimit::${userId}::${path}`;
  }
  ipRateLimitKey({ ip, path }: { ip: string; path: string }): string {
    return `Auth::RateLimit::${ip}::${path}`;
  }
  emailRateLimitKey({ email, path }: { email: string; path: string }): string {
    return `Auth::RateLimit::${email}::${path}`;
  }
  otpKey({ email, subject = EmailEnum.CONFIRM_EMAIL }: OtpKeyType): string {
    return `Auth::OTP::${email}::${subject}`;
  }
  otpMaxAttemptsKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `${this.otpKey({ email, subject })}::MaxTrial`;
  }
  OtpBlockKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `${this.otpKey({ email, subject })}::Block`;
  }
  FCMKey(userId: Types.ObjectId | string): string {
    return `FCM::User::${userId}`;
  }
  socketKey(userId: Types.ObjectId | string): string {
    return `Socket::User::${userId}`;
  }
  userVersionKey(id: Types.ObjectId | string): string {
    return `User::${id}::Version`;
  }
  userBaseKey({ id, version }: CacheUserPayLoadType): string {
    return `User::${id}::v${version}`;
  }
  userKey({ id, version }: CacheUserPayLoadType): string {
    return `${this.userBaseKey({ id, version })}::Root`;
  }
  userProfileKey({ id, version }: CacheUserPayLoadType): string {
    return `${this.userBaseKey({ id, version })}::Profile`;
  }
  userSettingsKey({ id, version }: CacheUserPayLoadType): string {
    return `${this.userBaseKey({ id, version })}::Settings`;
  }
  userStatsKey({ id, version }: CacheUserPayLoadType): string {
    return `${this.userBaseKey({ id, version })}::Stats`;
  }
  wholeProfileKey({ id, version }: CacheUserPayLoadType): string {
    return `${this.userBaseKey({ id, version })}::Whole_Profile`;
  }
  postVersionKey({
    userId,
    postId = "List",
  }: {
    userId: Types.ObjectId | string;
    postId?: Types.ObjectId | string;
  }): string {
    return `Post::User::${userId}::${postId}`;
  }
  postKey({
    userId,
    postId,
    context = PostContextEnum.OWNER,
    version,
  }: {
    userId: Types.ObjectId | string;
    postId: Types.ObjectId | string;
    context?: PostContextEnum;
    version: number;
  }): string {
    return `Post::User::${userId}::${postId}::${context}::v1${version}`;
  }
  postsListKey({
    targetUserId,
    page = PaginateDefault.PAGE,
    limit = PaginateDefault.LIMIT,
    search = PaginateDefault.SEARCH,
    context = PostContextEnum.OWNER,
    version,
  }: {
    targetUserId: Types.ObjectId | string;
    page?: number;
    limit?: number;
    search?: string;
    context?: PostContextEnum;
    version: number;
  }): string {
    return `Post::List::${targetUserId}::${page}::${limit}::${search}::${context}::v${version}`;
  }
  commentVersionKey(commentId: Types.ObjectId | string): string {
    return `Comment::User::::${commentId}`;
  }
  commentKey({
    commentId,
    version,
  }: {
    commentId: Types.ObjectId | string;
    version: number;
  }): string {
    return `Comment::${commentId}::v${version}`;
  }
  commentsListKey({
    postId,
    page = PaginateDefault.PAGE,
    limit = PaginateDefault.LIMIT,
    version,
  }: {
    postId: Types.ObjectId | string;
    page?: number;
    limit?: number;
    version: number;
  }): string {
    return `Comment::List::${postId}::${page}::${limit}::v${version}`;
  }
  messageVersionKey(chatId: Types.ObjectId | string): string {
    return `Chat::Messages::${chatId}::Version`;
  }
  messageKey({
    chatId,
    cursor,
    limit,
    version,
  }: {
    chatId: Types.ObjectId | string;
    cursor?: Types.ObjectId | string;
    limit: number;
    version: number;
  }): string {
    return `Chat::Messages::${chatId}::${cursor ?? "latest"}::${limit}::v${version}`;
  }

  //Core Operations
  async set({
    key,
    value,
    options,
  }: {
    key: string;
    value: unknown;
    options?: SetOptions;
  }): Promise<string | null> {
    try {
      return await this.client.set(key, JSON.stringify(value), options);
    } catch {
      console.log("Fail in redis set operation");
      return null;
    }
  }
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch {
      console.log("Fail in redis get operation");
      return null;
    }
  }
  async mGet(keys: string[]): Promise<Array<string | null>> {
    try {
      const values = await this.client.mGet(keys);
      return values.map((value) => {
        if (value === null) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch {
      console.log("Fail in redis mGet operation");
      return [];
    }
  }
  async del(keys: string[]): Promise<number> {
    try {
      if (!keys?.length) return 0;
      return await this.client.del(keys);
    } catch {
      console.log("Fail in redis del operation");
      return 0;
    }
  }
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch {
      console.log("Fail in redis incr operation");
      return 0;
    }
  }
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch {
      console.log("Fail in redis decr operation");
      return 0;
    }
  }
  async incrBy({
    key,
    increment,
  }: {
    key: string;
    increment: number;
  }): Promise<number> {
    try {
      return await this.client.incrBy(key, increment);
    } catch {
      console.log("Fail in redis incrBy operation");
      return 0;
    }
  }
  async decrBy({
    key,
    decrement,
  }: {
    key: string;
    decrement: number;
  }): Promise<number> {
    try {
      return await this.client.decrBy(key, decrement);
    } catch {
      console.log("Fail in redis decrBy operation");
      return 0;
    }
  }
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch {
      console.log("Fail in redis ttl operation");
      return -2;
    }
  }
  async expire({
    key,
    seconds,
    mode,
  }: {
    key: string;
    seconds: number;
    mode?: "NX" | "XX" | "GT" | "LT";
  }): Promise<number> {
    try {
      return await this.client.expire(key, seconds, mode);
    } catch {
      console.log("Fail in redis expire operation");
      return 0;
    }
  }
  async exists(keys: string[]): Promise<number> {
    try {
      return await this.client.exists(keys);
    } catch {
      console.log("Fail in redis exists operation");
      return 0;
    }
  }
  async scan({
    pattern,
    count = 100,
  }: {
    pattern: string;
    count?: number;
  }): Promise<string[]> {
    try {
      let cursor = "0";
      const results: string[] = [];
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: count,
        });
        cursor = reply.cursor;
        results.push(...reply.keys);
      } while (cursor !== "0");
      return results;
    } catch {
      console.log("Fail in redis scan operation");
      return [];
    }
  }
  async sAdd({
    key,
    members,
  }: {
    key: string;
    members: Array<string> | string;
  }): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch {
      console.log("Fail in redis sAdd operation");
      return 0;
    }
  }
  async sRem({
    key,
    members,
  }: {
    key: string;
    members: string[] | string;
  }): Promise<number> {
    try {
      return await this.client.sRem(key, members);
    } catch {
      console.log("Fail in redis sRem operation");
      return 0;
    }
  }
  async sMembers(key: string): Promise<Array<string>> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      console.log("Fail in redis sMembers operation", error);
      return [];
    }
  }
  async sCard(key: string): Promise<number> {
    try {
      return await this.client.sCard(key);
    } catch {
      console.log("Fail in redis sCard operation");
      return 0;
    }
  }
  async pipeline<T>({
    items,
    command,
  }: {
    items: Array<T>;
    command: (item: T, pipeline: any) => void;
  }): Promise<Array<T>> {
    const pipeline = this.client.multi();
    for (const item of items) {
      command(item, pipeline);
    }

    return (await pipeline.exec()) as unknown as Array<T>;
  }

  //Cache Helpers
  async cache<T = unknown>({
    key,
    ttl,
    fn,
  }: {
    key: string;
    ttl: number;
    fn: () => Promise<T>;
  }): Promise<T | null> {
    const cached = await this.get<T>(key);
    if (cached) {
      console.log("redis");

      return cached;
    }

    const result = await fn();
    if (result === undefined || result === null) return null;

    await this.set({
      key,
      value: result,
      options: { expiration: { type: "EX", value: ttl } },
    });

    return result;
  }
  async getOrFetch<T = unknown>({
    key,
    fn,
  }: {
    key: string;
    fn: () => Promise<T>;
  }): Promise<T | null> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const result = await fn();
    if (result === undefined || result === null) return null;

    return result;
  }
  async getUserVersion(id: Types.ObjectId | string): Promise<number> {
    const key = this.userVersionKey(id);
    const previous = await this.client.set(key, "1", {
      condition: "NX",
      GET: true,
    });

    return previous ? Number(previous) : 1;
  }
  async getPostVersion({
    userId,
    postId = "List",
  }: {
    userId: Types.ObjectId | string;
    postId?: Types.ObjectId | string;
  }): Promise<number> {
    const key = this.postVersionKey({ userId, postId });
    const previous = await this.client.set(key, "1", {
      condition: "NX",
      GET: true,
    });

    return previous ? Number(previous) : 1;
  }
  async getCommentVersion(commentId: Types.ObjectId | string): Promise<number> {
    const key = this.commentVersionKey(commentId);
    const previous = await this.client.set(key, "1", {
      condition: "NX",
      GET: true,
    });

    return previous ? Number(previous) : 1;
  }
  async getMessageVersion(chatId: Types.ObjectId | string): Promise<number> {
    const key = this.messageVersionKey(chatId);
    const previous = await this.client.set(key, "1", {
      condition: "NX",
      GET: true,
    });

    return previous ? Number(previous) : 1;
  }
  async incrementUserVersion(id: Types.ObjectId | string): Promise<number> {
    const key = this.userVersionKey(id);

    return await this.incr(key);
  }
  async incrementPostVersion({
    userId,
    postId = "List",
  }: {
    userId: Types.ObjectId | string;
    postId?: Types.ObjectId | string;
  }): Promise<number> {
    const key = this.postVersionKey({ userId, postId });
    return await this.incr(key);
  }
  async incrementCommentVersion(
    commentId: Types.ObjectId | string,
  ): Promise<number> {
    const key = this.commentVersionKey(commentId);

    return await this.incr(key);
  }
  async incrementMessagesVersion(
    chatId: Types.ObjectId | string,
  ): Promise<number> {
    const key = this.messageVersionKey(chatId);

    return await this.incr(key);
  }
}

export const redisService = new RedisService();
