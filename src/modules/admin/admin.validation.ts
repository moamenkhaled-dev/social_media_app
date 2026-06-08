import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";

class AdminValidation {
  //ban user
  ban = z.strictObject({
    targetUserId: generalValidationFields.id,
    banReason: generalValidationFields.string(5, 50),
  });

  //unBan
  unBan = z.strictObject({ targetUserId: generalValidationFields.id });

  //banned users list
  bannedUsersList = z.strictObject({}).extend(PaginateValidation.shape);
}

export const adminValidation = new AdminValidation();
