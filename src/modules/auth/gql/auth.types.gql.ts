import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class AuthGraphQlType {
  private readonly graphQLTypes = graphQLTypes;

  //signup
  signup = new GraphQLObjectType({
    name: "signup",
    description: "fields that this type will return",
    fields: {
      message: { type: this.graphQLTypes.messageType },
      data: { type: this.graphQLTypes.oneAuthType },
    },
  });

  //resend confirm email otp
  resendConfirmEmailOtp = new GraphQLObjectType({
    name: "resendConfirmEmailOtp",
    fields: { message: { type: this.graphQLTypes.messageType } },
  });

  //confirm email
  confirmEmail = new GraphQLObjectType({
    name: "confirmEmailType",
    fields: {
      message: { type: this.graphQLTypes.messageType },
      data: { type: this.graphQLTypes.oneAuthType },
    },
  });

  //login
  login = new GraphQLObjectType({
    name: "loginType",
    fields: {
      message: { type: this.graphQLTypes.messageType },
      data: {
        type: new GraphQLNonNull(
          new GraphQLObjectType({
            name: "loginTypeData",
            fields: {
              accessToken: { type: new GraphQLNonNull(GraphQLString) },
              refreshToken: { type: new GraphQLNonNull(GraphQLString) },
              _id: { type: GraphQLID },
              userEmail: { type: GraphQLString },
            },
          }),
        ),
      },
    },
  });

  //forgot password
  forgotPassword = new GraphQLObjectType({
    name: "forgotPasswordType",
    fields: {
      message: { type: this.graphQLTypes.messageType },
    },
  });

  //reset password
  resetPassword = new GraphQLObjectType({
    name: "resetPasswordType",
    fields: { message: { type: this.graphQLTypes.messageType } },
  });
}

export const authGraphQlType = new AuthGraphQlType();
