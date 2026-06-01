import type { HydratedDocument } from "mongoose";
import type { IUser, IUserMethod } from "../interfaces/user.interfaces.ts";
import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user: HydratedDocument<IUser, IUserMethod>;
    decode: JwtPayload;
  }
}
