import type { Types } from "mongoose";

export type SignupResponse = {
  message: string;
  data: { userEmail: string; _id: Types.ObjectId };
};

export interface ILoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    _id: Types.ObjectId;
    userEmail: string;
  };
}
