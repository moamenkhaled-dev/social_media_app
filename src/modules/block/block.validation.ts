import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";

class BlockValidation {
  //block
  block = z.strictObject({ targetUserId: generalValidationFields.id });

  //block list
  blockList = z.strictObject({}).extend(PaginateValidation.shape);
}

export const blockValidation = new BlockValidation();
