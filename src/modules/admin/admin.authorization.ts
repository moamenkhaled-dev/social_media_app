import { RoleEnum } from "../../common/enums/user.enums.js";

export const endPoints = {
  //ban
  ban: [RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN],

  //banned users list
  bannedUsersList: [RoleEnum.ADMIN, RoleEnum.MODERATOR, RoleEnum.SUPER_ADMIN],

  //admin delete user
  adminDeleteUser: [RoleEnum.ADMIN, RoleEnum.MODERATOR, RoleEnum.SUPER_ADMIN],
};
