import { RoleEnum } from "../../common/enums/user.enums.js";

export const endpoints = {
  //report
  report: [RoleEnum.USER],
  //open report
  reportsAndModerationCases: [
    RoleEnum.SUPER_ADMIN,
    RoleEnum.ADMIN,
    RoleEnum.MODERATOR,
  ],
  //take action for moderation case
  takeActionForModerationCase: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN],
};
