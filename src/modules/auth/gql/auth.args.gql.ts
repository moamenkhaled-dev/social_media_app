import { GraphQLNonNull, GraphQLString } from "graphql";
import { GQLGenderEnum } from "../../../common/enums/gql.enums.js";

class AuthGraphQlArgs {
  //signup
  signup = {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: GraphQLString },
    countryCode: { type: GraphQLString },
    username: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GQLGenderEnum) },
    DOB: { type: new GraphQLNonNull(GraphQLString) },
  };

  //resend confirm email otp
  resendConfirmEmailOtp = {
    email: { type: new GraphQLNonNull(GraphQLString) },
  };

  //confirm email
  confirmEmail = {
    email: { type: new GraphQLNonNull(GraphQLString) },
    otp: { type: new GraphQLNonNull(GraphQLString) },
  };

  //login
  login = {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    FCM: { type: GraphQLString },
  };

  //forgot password
  forgotPassword = {
    email: { type: new GraphQLNonNull(GraphQLString) },
  };

  //reset password
  resetPassword = {
    otp: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
  };
}

export const authGraphQlArgs = new AuthGraphQlArgs();
