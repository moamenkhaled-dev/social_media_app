//token type
export enum TokenTypeEnum {
  ACCESS = "Access",
  REFRESH = "Refresh",
}

//keyGenerator
export enum KeyGeneratorEnum {
  IP,
  USER,
  EMAIL,
}

//email
export enum EmailEnum {
  CONFIRM_EMAIL = "Confirm_Email",
  FORGOT_PASSWORD = "Forgot_Password",
}

//logout
export enum LogoutFlagEnum {
  ALL = "All",
  ONE = "One",
}
