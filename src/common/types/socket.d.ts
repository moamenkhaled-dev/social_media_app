import type { Socket } from "socket.io";
import type { IAuth } from "../../modules/auth/auth.js";
import type { HydratedDocument, Types } from "mongoose";
import type { IUser, IUserMethod } from "../interfaces/user.interfaces.ts";

export interface IAuthSocket extends Socket {
  data: {
    user: HydratedDocument<IUser, IUserMethod>;
    decode?: JwtPayload;
    currentChat?: Types.ObjectId | string | null;
  };
}
