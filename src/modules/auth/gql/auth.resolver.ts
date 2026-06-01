import { redisService } from "../../../common/services/redis.service.js";
import type { IGQqlContext } from "../../../common/types/gql.js";
import { graphQlRateLimit } from "../../../middlewares/rateLimit/gql.rateLimit.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type {
  ConfirmEmailDto,
  ForgotPasswordDto,
  LoginDto,
  ResendConfirmEmailOtpDto,
  ResetPasswordDto,
  SignupDto,
} from "../auth.js";
import type { ILoginResponse, SignupResponse } from "../auth.entity.js";
import { authService } from "../auth.service.js";
import { authValidationSchema } from "../auth.validation.js";

class AuthGraphQlResolver {
  private readonly authService = authService;
  private authSchema = authValidationSchema;
  private redis = redisService;

  //signup
  signup = async (
    parent: any,
    { username, email, password, phone, gender, DOB, countryCode }: SignupDto,
  ): Promise<SignupResponse> => {
    //rateLimit
    const key = this.redis.emailRateLimitKey({
      email,
      path: `signup`,
    });
    await graphQlRateLimit({ key, limit: 1, windowMs: 60 * 1000 });
    //validation
    await GQLValidate<SignupDto>({
      schema: this.authSchema.signup,
      args: { username, email, password, phone, gender, DOB, countryCode },
    });
    //service
    const { message, data } = await this.authService.signup({
      username,
      email,
      password,
      phone,
      gender,
      DOB,
      countryCode: countryCode,
    });

    return { message, data };
  };

  //resend confirm email otp
  resendConfirmEmailOtp = async (
    parent: any,
    { email }: ResendConfirmEmailOtpDto,
  ): Promise<{ message: string }> => {
    //rateLimit
    const key = this.redis.emailRateLimitKey({
      email,
      path: `resendConfirmEmailOtp`,
    });
    await graphQlRateLimit({ key, limit: 1, windowMs: 60 * 1000 });
    //validation
    await GQLValidate<ResendConfirmEmailOtpDto>({
      schema: this.authSchema.resendConfirmEmailOtp,
      args: { email },
    });
    const { message } = await this.authService.resendConfirmEmailOtp({ email });

    return { message };
  };

  //confirm email
  confirmEmail = async (
    parent: any,
    { email, otp }: ConfirmEmailDto,
  ): Promise<SignupResponse> => {
    //rate limit
    const key = this.redis.emailRateLimitKey({
      email,
      path: `confirmEmail`,
    });
    await graphQlRateLimit({ key, limit: 5, windowMs: 60 * 10 * 1000 });
    //validation
    await GQLValidate<ConfirmEmailDto>({
      schema: this.authSchema.confirmEmail,
      args: { email, otp },
    });
    //service
    const { message, data } = await this.authService.confirmEmail({
      email,
      otp,
    });

    return { message, data };
  };

  //login
  login = async (
    parent: any,
    { email, password, FCM }: LoginDto,
    context: IGQqlContext,
  ): Promise<ILoginResponse> => {
    //rate limit
    const key = this.redis.ipRateLimitKey({
      ip: context.req.raw.ip as string,
      path: `login`,
    });
    await graphQlRateLimit({ key, limit: 3, windowMs: 60 * 10 * 1000 });
    //validation
    await GQLValidate<LoginDto>({
      schema: this.authSchema.login,
      args: { email, password, FCM },
    });
    //service
    const { message, data } = await this.authService.login({
      email,
      password,
      FCM,
    });

    return { message, data };
  };

  //forgot password
  forgotPassword = async (
    parent: any,
    { email }: ForgotPasswordDto,
  ): Promise<{ message: string }> => {
    //rate limit
    const key = this.redis.emailRateLimitKey({
      email,
      path: `forgotPassword`,
    });
    await graphQlRateLimit({ key, limit: 1, windowMs: 60 * 1000 });
    //validation
    await GQLValidate<ForgotPasswordDto>({
      schema: this.authSchema.forgotPassword,
      args: { email },
    });
    //service
    const message = await this.authService.forgotPassword({ email });

    return message;
  };

  //reset password
  resetPassword = async (
    parent: any,
    { otp, email, password, confirmPassword }: ResetPasswordDto,
  ): Promise<{ message: string }> => {
    //rate limit
    const key = this.redis.emailRateLimitKey({ email, path: `resetPassword` });
    await graphQlRateLimit({ key, limit: 3, windowMs: 60 * 1000 });
    //validation
    await GQLValidate<ResetPasswordDto>({
      schema: this.authSchema.resetPassword,
      args: { otp, email, password, confirmPassword },
    });
    //service
    const message = await this.authService.resetPassword({
      otp,
      email,
      password,
      confirmPassword,
    });

    return message;
  };
}

export const authGraphQlResolver = new AuthGraphQlResolver();
