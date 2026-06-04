import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";

class FollowValidation {
  //follow user
  followUser = z.strictObject({ targetUserId: generalValidationFields.id });

  //followers list
  followersList = z
    .strictObject({ targetUserId: generalValidationFields.id })
    .extend(PaginateValidation.shape);

  //follow requests list
  followRequestsList = z.strictObject({}).extend(PaginateValidation.shape);
}

export const followValidation = new FollowValidation();
