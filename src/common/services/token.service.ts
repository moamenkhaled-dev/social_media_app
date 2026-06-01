import jwt, {
  type DecodeOptions,
  type JwtPayload,
  type SignOptions,
  type VerifyOptions,
} from "jsonwebtoken";
import { RoleEnum } from "../enums/user.enums.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  SYSTEM_ACCESS_TOKEN_SECRET_KEY,
  SYSTEM_REFRESH_TOKEN_SECRET_KEY,
  TOKEN_ISSUER,
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../config/config.js";
import type { HydratedDocument } from "mongoose";
import type { IUser, IUserMethod } from "../interfaces/user.interfaces.js";
import { randomUUID } from "node:crypto";
import { TokenTypeEnum } from "../enums/security.enums.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/client.errors.js";
import { redisService } from "./redis.service.js";
import { UserRepository } from "../../infra/repository/index.js";
import { toObjectId } from "../objectId.js";

class TokenService {
  private readonly redis = redisService;
  private readonly userRepoRepository: UserRepository;
  constructor() {
    this.userRepoRepository = new UserRepository();
  }

  //get token signature
  async getTokenSignature(
    role: RoleEnum,
  ): Promise<{ accessSignature: string; refreshSignature: string }> {
    let accessSignature: string;
    let refreshSignature: string;
    if (role != RoleEnum.USER) {
      accessSignature = SYSTEM_ACCESS_TOKEN_SECRET_KEY;
      refreshSignature = SYSTEM_REFRESH_TOKEN_SECRET_KEY;
    } else {
      accessSignature = USER_ACCESS_TOKEN_SECRET_KEY;
      refreshSignature = USER_REFRESH_TOKEN_SECRET_KEY;
    }

    return { accessSignature, refreshSignature };
  }

  //sign
  async sign({
    payload,
    secretKey,
    options,
  }: {
    payload: JwtPayload;
    secretKey: string;
    options?: SignOptions;
  }): Promise<string> {
    return jwt.sign(payload, secretKey, options);
  }

  //create login credentials
  async createLoginCredentials({
    user,
    issuer = TOKEN_ISSUER,
  }: {
    user: HydratedDocument<IUser, IUserMethod>;
    issuer?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessSignature, refreshSignature } = await this.getTokenSignature(
      user.role,
    );
    const jwtid = randomUUID();
    const accessToken = await this.sign({
      payload: { sub: user._id.toString() },
      secretKey: accessSignature,
      options: {
        issuer,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        audience: [TokenTypeEnum.ACCESS, user.role],
        jwtid,
      },
    });
    const refreshToken = await this.sign({
      payload: { sub: user._id.toString() },
      secretKey: refreshSignature,
      options: {
        issuer,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        audience: [TokenTypeEnum.REFRESH, user.role],
        jwtid,
      },
    });

    return { accessToken, refreshToken };
  }

  //decode
  async decode({
    token,
    options,
  }: {
    token: string;
    options?: DecodeOptions;
  }): Promise<JwtPayload> {
    return jwt.decode(token, options) as JwtPayload;
  }

  //verify
  async verify({
    token,
    secretKey,
    options,
  }: {
    token: string;
    secretKey: string;
    options?: VerifyOptions;
  }): Promise<JwtPayload> {
    return jwt.verify(token, secretKey, options) as JwtPayload;
  }

  //authenticate token
  async authenticateToken({
    token,
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    token: string;
    tokenType?: TokenTypeEnum;
  }): Promise<{
    user: HydratedDocument<IUser, IUserMethod>;
    decode: JwtPayload;
  }> {
    //decode token
    const decode = await this.decode({ token });
    //destruct aud
    const [audTokenType, role] = decode.aud as [TokenTypeEnum, RoleEnum];
    if (audTokenType !== tokenType) {
      throw new BadRequestError(
        `invalid token type as we expect ${tokenType} and you pass ${audTokenType}`,
      );
    }
    //get token secret
    const { accessSignature, refreshSignature } =
      await this.getTokenSignature(role);
    const secretKey =
      tokenType === TokenTypeEnum.ACCESS ? accessSignature : refreshSignature;
    //verify token
    const verifiedData = await this.verify({
      token,
      secretKey,
      options: { issuer: TOKEN_ISSUER },
    });
    if (!verifiedData) {
      throw new UnauthorizedError("this token hasn't created by our server");
    }
    //check token revoke
    const revokeTokenKey = this.redis.revokeTokenKey({
      userId: toObjectId(verifiedData.sub as string),
      jti: verifiedData.jti as string,
    });
    const isRevoked = await this.redis.get(revokeTokenKey);
    if (isRevoked) {
      throw new BadRequestError("please login first");
    }
    //check user exist
    const user = await this.userRepoRepository.findOne({
      filter: { _id: verifiedData.sub },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    //check change credentials
    if (
      user.changeCredentialsTime &&
      (decode.iat as number) * 1000 + 1000 <
        user.changeCredentialsTime?.getTime()
    ) {
      throw new BadRequestError("revoked token please login first");
    }

    return { user, decode };
  }
}

export const tokenService = new TokenService();
