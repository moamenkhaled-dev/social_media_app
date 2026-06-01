import { GraphQLObjectType, GraphQLString } from "graphql";
import { authGraphQlArgs } from "./auth.args.gql.js";
import { authGraphQlResolver } from "./auth.resolver.js";
import { authGraphQlType } from "./auth.types.gql.js";

class AuthGraphQlSchema {
  private authType = authGraphQlType;
  private authArgs = authGraphQlArgs;
  private authResolver = authGraphQlResolver;

  //mutation
  registerMutation() {
    return {
      //signup
      signup: {
        description: "signup schema mutation",
        type: this.authType.signup,
        args: this.authArgs.signup,
        resolve: this.authResolver.signup,
      },

      //confirm email
      confirmEmail: {
        description: "Confirm email",
        type: this.authType.confirmEmail,
        args: this.authArgs.confirmEmail,
        resolve: this.authResolver.confirmEmail,
      },

      //resend confirm email otp
      resendConfirmEmailOtp: {
        description: "resend confirm email otp",
        type: this.authType.resendConfirmEmailOtp,
        args: this.authArgs.resendConfirmEmailOtp,
        resolve: this.authResolver.resendConfirmEmailOtp,
      },

      //login
      login: {
        description: "login schema mutation",
        type: this.authType.login,
        args: this.authArgs.login,
        resolve: this.authResolver.login,
      },

      //forgot password
      forgotPassword: {
        description: "forgot password mutation",
        type: this.authType.forgotPassword,
        args: this.authArgs.forgotPassword,
        resolve: this.authResolver.forgotPassword,
      },

      //reset password
      resetPassword: {
        description: "forgot password mutation",
        type: this.authType.resetPassword,
        args: this.authArgs.resetPassword,
        resolve: this.authResolver.resetPassword,
      },
    };
  }
}

export const authGraphQlSchema = new AuthGraphQlSchema();
