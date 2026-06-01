import type z from "zod";
import type { HydratedDocument } from "mongoose";

import type { authValidationSchema } from "./auth.validation.ts";
import type {
  IUser,
  IUserMethod,
} from "../../common/interfaces/user.interfaces.ts";
import type { JwtPayload } from "jsonwebtoken";

export type IAuth = {
  user: HydratedDocument<IUser, IUserMethod>;
  decode?: JwtPayload;
};

export type SignupDto = z.infer<typeof authValidationSchema.signup>;

export type ResendConfirmEmailOtpDto = z.infer<
  typeof authValidationSchema.resendConfirmEmailOtp
>;

export type ConfirmEmailDto = z.infer<typeof authValidationSchema.confirmEmail>;

export type LoginDto = z.infer<typeof authValidationSchema.login>;

export type ForgotPasswordDto = z.infer<
  typeof authValidationSchema.forgotPassword
>;

export type ResetPasswordDto = z.infer<
  typeof authValidationSchema.resetPassword
>;
