import { startSession, Types, type HydratedDocument } from "mongoose";

import {
  JobEnum,
  EmailEnum,
  ProviderEnum,
  NotificationTargetTypeEnum,
  NotificationTypeEnum,
  PushStatusEnum,
} from "../../common/enums/index.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../common/errors/client.errors.js";
import { generateOtp } from "../../common/otp.js";
import { emailQueue } from "../../infra/queue/queues/email.queue.js";
import { redisService } from "../../common/services/redis.service.js";
import { securityService, tokenService } from "../../common/services/index.js";
import { emailTemplate } from "../../common/utils/email/template.email.js";
import { CLIENT_ID, OTP_SALT_ROUND } from "../../config/config.js";
import {
  ProfileRepository,
  SettingsRepository,
  StatsRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import type {
  ConfirmEmailDto,
  ForgotPasswordDto,
  LoginDto,
  ResendConfirmEmailOtpDto,
  ResetPasswordDto,
  SignupDto,
} from "./auth.js";
import type { ILoginResponse, SignupResponse } from "./auth.entity.js";
import { phoneValidator } from "../../common/validation/phone.validation.js";
import { platform } from "node:os";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import { notificationService } from "../notification/notification.service.js";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { InternalServerError } from "../../common/errors/server.errors.js";
import type { IUser } from "../../common/interfaces/user.interfaces.js";

class AuthService {
  private readonly redis = redisService;
  private readonly security = securityService;
  private readonly userRepository: UserRepository;
  private readonly profileRepository: ProfileRepository;
  private readonly settingsRepository: SettingsRepository;
  private readonly statsRepository: StatsRepository;
  private readonly token = tokenService;
  private readonly notification = notificationService;

  constructor() {
    this.userRepository = new UserRepository();
    this.profileRepository = new ProfileRepository();
    this.settingsRepository = new SettingsRepository();
    this.statsRepository = new StatsRepository();
  }

  //send email
  private async sendMail({
    email,
    subject,
    title,
  }: {
    email: string;
    subject: EmailEnum;
    title: string;
  }): Promise<void> {
    //check is blocked
    const blockKey = this.redis.OtpBlockKey({ email, subject });
    const isBlockedTTL = await this.redis.ttl(blockKey);
    if (isBlockedTTL >= 0) {
      throw new ConflictError(
        `you are blocked please try again after ${isBlockedTTL} seconds`,
      );
    }
    //check attempts count
    const maxAttemptsKey = this.redis.otpMaxAttemptsKey({
      email,
      subject,
    });
    const count = await this.redis.get<number>(maxAttemptsKey);
    if (count && count > 3) {
      await this.redis.set({
        key: blockKey,
        value: 1,
        options: { expiration: { type: "EX", value: 10 * 60 } },
      });
    }
    await this.redis.incr(maxAttemptsKey);
    //check otp valid
    const otpKey = this.redis.otpKey({ email, subject });
    const isValidOtp = await this.redis.ttl(otpKey);
    if (isValidOtp >= 0) {
      throw new ConflictError("the previous otp is still valid");
    }
    const otp = await generateOtp();
    const hashedOtp = await this.security.hash({
      data: `${otp}`,
      rounds: OTP_SALT_ROUND,
    });
    await this.redis.set({
      key: otpKey,
      value: hashedOtp,
      options: { expiration: { type: "EX", value: 10 * 60 } },
    });
    await emailQueue.add(
      JobEnum.SEND_EMAIL,
      {
        to: email,
        subject,
        html: emailTemplate({ title, code: otp }),
      },
      {
        // jobId: `${email}_${subject}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  //verify google account
  private async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestError(
        "Fail to authenticate this account with google",
      );
    }

    return payload;
  }

  //signup with gmail
  async signupWithGmail(idToken: string): Promise<{
    credentials: { accessToken: string; refreshToken: string };
    status: number;
  }> {
    const payload = await this.verifyGoogleAccount(idToken);
    const isUserExist = await this.userRepository.findOne({
      filter: { email: payload.email as string },
    });
    if (isUserExist) {
      if (isUserExist.provider !== ProviderEnum.GOOGLE) {
        throw new ConflictError("email already exist");
      }

      return {
        status: 200,
        credentials: await this.loginWithGmail(idToken),
      };
    }
    const session = await startSession();
    session.startTransaction();
    let user: any;
    try {
      user = await this.userRepository.createOne({
        data: {
          email: payload.email as string,
          provider: ProviderEnum.GOOGLE,

          verifiedAt: new Date(),
        },
      });
      await this.profileRepository.createOne({
        data: {
          ownerId: user?._id as Types.ObjectId,
          username: `${payload.given_name as string} ${payload.family_name as string}`,
          avatarUrl: payload.profile as string,
          DOB: new Date(),
        },
        options: { session },
      });
      await this.settingsRepository.createOne({
        data: { ownerId: user?._id as Types.ObjectId },
        options: { session },
      });
      await this.statsRepository.createOne({
        data: { ownerId: user?._id as Types.ObjectId },
        options: { session },
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    if (!user) {
      throw new InternalServerError(`Fail to signup please try again later`);
    }

    return {
      status: 201,
      credentials: await this.token.createLoginCredentials({
        user,
      }),
    };
  }

  //login with gmail
  async loginWithGmail(idToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = await this.verifyGoogleAccount(idToken);
    const user = await this.userRepository.findOne({
      filter: {
        email: payload.email as string,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.GOOGLE,
      },
    });
    if (!user) {
      throw new NotFoundError("user not found");
    }

    return await this.token.createLoginCredentials({ user });
  }

  //signup
  async signup(inputs: SignupDto): Promise<SignupResponse> {
    const { username, email, password, phone, gender, DOB, countryCode } =
      inputs;
    const isUserExist = await this.userRepository.findOne({
      filter: {
        email,
        paranoid: false,
        includeDeactivated: true,
        includeUnverified: true,
        includeBanned: true,
      },
    });
    if (isUserExist) {
      throw new ConflictError("email already exist");
    }
    let user;
    let validatedPhone: string | undefined;
    if (phone && countryCode) {
      validatedPhone = await phoneValidator({ countryCode, phone });
    }
    const session = await startSession();
    session.startTransaction();
    try {
      user = await this.userRepository.createOne({
        data: { email, password, phone: validatedPhone },
        options: { session },
      });
      await this.profileRepository.createOne({
        data: {
          ownerId: user?._id as Types.ObjectId,
          username,
          gender,
          DOB: new Date(DOB),
        },
        options: { session },
      });
      await this.settingsRepository.createOne({
        data: { ownerId: user?._id as Types.ObjectId },
        options: { session },
      });
      await this.statsRepository.createOne({
        data: { ownerId: user?._id as Types.ObjectId },
        options: { session },
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
    await this.sendMail({
      email,
      subject: EmailEnum.CONFIRM_EMAIL,
      title: "Verify your email",
    });

    return {
      message: "Otp sent successfully please check your gmail",
      data: { userEmail: email, _id: user?._id as Types.ObjectId },
    };
  }

  //confirm email
  async confirmEmail(inputs: ConfirmEmailDto): Promise<SignupResponse> {
    const { email, otp } = inputs;
    const user = await this.userRepository.findOne({
      filter: { email, onlyNotVerified: true, provider: ProviderEnum.SYSTEM },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const otpKey = this.redis.otpKey({
      email,
      subject: EmailEnum.CONFIRM_EMAIL,
    });
    const isExpiredOtp = await this.redis.get<string>(otpKey);
    if (!isExpiredOtp) {
      throw new BadRequestError("Expired OTP");
    }
    const isValidOtp = await this.security.compare({
      data: otp,
      encrypted: isExpiredOtp,
    });
    if (!isValidOtp) {
      throw new BadRequestError("Wrong OTP");
    }
    user.verifiedAt = new Date();
    await user.save();
    const rateLimitKeys = await this.redis.scan({
      pattern: `${this.redis.emailRateLimitKey({ email, path: `confirmEmail` })}`,
    });
    const otpKeys = await this.redis.scan({ pattern: `${otpKey}*` });
    await this.redis.del([...rateLimitKeys, ...otpKeys]);

    return {
      message: "Email confirmed",
      data: { _id: user._id, userEmail: email },
    };
  }

  //resend confirm email
  async resendConfirmEmailOtp(
    inputs: ResendConfirmEmailOtpDto,
  ): Promise<{ message: string }> {
    const { email } = inputs;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        onlyNotVerified: true,
      },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await this.sendMail({
      email,
      subject: EmailEnum.CONFIRM_EMAIL,
      title: "Confirm Email Otp",
    });

    return { message: "OTP sent successfully please check your gmail" };
  }

  //login
  async login(inputs: LoginDto): Promise<ILoginResponse> {
    const { email, password, FCM } = inputs;
    const user = await this.userRepository.findOne({ filter: { email } });
    if (!user) {
      throw new NotFoundError("Invalid login credentials");
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new NotFoundError("Invalid login credentials");
    }
    const { accessToken, refreshToken } =
      await this.token.createLoginCredentials({ user });
    const notificationDB = await this.notification.createOneNotification({
      recipientId: user._id,
      actorId: user._id,
      notificationType: NotificationTypeEnum.SYSTEM,
      notificationTargetType: NotificationTargetTypeEnum.USER,
      notificationTargetId: user._id,
      title: "new login",
      body: `there is new login from ${platform()}`,
      pushStatus: PushStatusEnum.PENDING,
    });
    if (FCM) {
      const key = this.redis.FCMKey(user._id);
      await this.redis.sAdd({ key, members: FCM });
      await notificationQueue.add(JobEnum.SEND_MULTIPLE_NOTIFICATIONS, {
        userIds: [user._id],
        title: "new login",
        body: JSON.stringify({
          message: `there is new login from ${platform()}`,
          notificationId: notificationDB._id.toString(),
          userId: user._id,
        }),
        notificationId: notificationDB._id,
      });
      user.lastLoginAt = new Date();
      user.save();
    }

    return {
      message: "Login successful",
      data: { accessToken, refreshToken, _id: user._id, userEmail: email },
    };
  }

  //forgot password
  async forgotPassword(
    inputs: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = inputs;
    const user = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM },
    });
    if (!user) {
      throw new NotFoundError("User not found may be it is wrong email");
    }
    await this.sendMail({
      email,
      subject: EmailEnum.FORGOT_PASSWORD,
      title: "forgot password otp",
    });

    return { message: "OTP Sent please check your gmail" };
  }

  //reset password
  async resetPassword(inputs: ResetPasswordDto): Promise<{ message: string }> {
    const { otp, email, password } = inputs;
    const user = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const key = this.redis.otpKey({
      email,
      subject: EmailEnum.FORGOT_PASSWORD,
    });
    const isExpiredOtp = await this.redis.get<string>(key);
    if (!isExpiredOtp) {
      throw new BadRequestError("Expired OTP");
    }
    const isCorrectOtp = await this.security.compare({
      data: otp,
      encrypted: isExpiredOtp,
    });
    if (!isCorrectOtp) {
      throw new BadRequestError("Wrong OTP");
    }
    user.password = password;
    user.changeCredentialsTime = new Date();
    await user.save();
    const keys = await this.redis.scan({
      pattern: `${this.redis.otpKey({ email, subject: EmailEnum.FORGOT_PASSWORD })}`,
    });
    await this.redis.del(keys);

    return { message: "password reset correctly" };
  }
}

export const authService = new AuthService();
