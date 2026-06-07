import type { NextFunction, Request, Response } from "express";

import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../common/errors/index.js";
import type { RoleEnum } from "../common/enums/index.js";
import { TokenTypeEnum } from "../common/enums/security.enums.js";
import { tokenService } from "../common/services/token.service.js";
import type { IGQqlContext } from "../common/types/gql.js";
import type { IAuth } from "../modules/auth/auth.js";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../common/interfaces/user.interfaces.js";

//authentication
export const authentication = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.headers?.authorization) {
      throw new BadRequestError("No headers passed");
    }
    const [flag, token] = req.headers.authorization.split(" ");
    if (!token) {
      throw new BadRequestError("No token passed");
    }
    const { user, decode } = await tokenService.authenticateToken({
      token,
      tokenType,
    });
    req.user = user;
    req.decode = decode;

    next();
  };
};

//authorization
export const restFullApiAuthorization = (roles: Array<RoleEnum>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("you are not authorized");
    }

    next();
  };
};

//graphQL authorization
export const GraphQLAuthorization = async ({
  user,
  allowedRoles,
}: {
  user: HydratedDocument<IUser>;
  allowedRoles: Array<RoleEnum>;
}) => {
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`you are not authorized`);
  }
};

//gql authentication
export const GQLAuthentication = async ({
  context,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  context: IGQqlContext;
  tokenType?: TokenTypeEnum;
}): Promise<IAuth> => {
  const authorization = context.req.raw.headers.authorization;
  if (!authorization) {
    throw new UnauthorizedError("No authorization header");
  }
  const [flag, token] = authorization.split(" ");
  if (!token?.trim().length) {
    throw new UnauthorizedError("No token passed");
  }
  const { user, decode } = await tokenService.authenticateToken({
    token,
    tokenType,
  });

  return { user, decode };
};
