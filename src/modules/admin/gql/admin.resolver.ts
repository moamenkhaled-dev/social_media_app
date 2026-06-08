import type { IGQqlContext } from "../../../common/types/gql.js";
import {
  GQLAuthentication,
  GraphQLAuthorization,
} from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { endPoints } from "../admin.authorization.js";
import type { IBannedUsersListResponse } from "../admin.entity.js";
import type {
  BannedUsersListDto,
  GraphQLBanDto,
  GraphQLUnBanDto,
} from "../admin.js";
import { adminService } from "../admin.service.js";
import { adminValidation } from "../admin.validation.js";

class AdminResolver {
  private readonly adminValidation = adminValidation;
  private readonly adminService = adminService;

  //ban
  ban = async (
    parent: any,
    { targetUserId, banReason }: GraphQLBanDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({ user, allowedRoles: endPoints.ban });
    //validation
    const validatedData = await GQLValidate<GraphQLBanDto>({
      schema: this.adminValidation.ban,
      args: { targetUserId, banReason },
    });
    //service
    await this.adminService.banUser({ user, ...validatedData });

    return { message: "Success" };
  };

  //unBan
  unBan = async (
    parent: any,
    { targetUserId }: GraphQLUnBanDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({ user, allowedRoles: endPoints.ban });
    //validation
    const validatedData = await GQLValidate<GraphQLUnBanDto>({
      schema: this.adminValidation.unBan,
      args: { targetUserId },
    });
    //service
    await this.adminService.unBan({ user, ...validatedData });

    return { message: "Success" };
  };

  //banned users list
  bannedUsersList = async (
    parent: any,
    { page, limit, search }: BannedUsersListDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: Array<IBannedUsersListResponse> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //authorization
    await GraphQLAuthorization({ user, allowedRoles: endPoints.ban });
    //validation
    const validatedData = await GQLValidate<BannedUsersListDto>({
      schema: this.adminValidation.bannedUsersList,
      args: { page, limit, search },
    });
    //service
    const users = await this.adminService.bannedUsersList({ ...validatedData });

    return { message: "Success", data: users };
  };
}

export const adminResolver = new AdminResolver();
