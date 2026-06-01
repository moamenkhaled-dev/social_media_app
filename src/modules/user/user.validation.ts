import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

class UserValidationSchema {
  //logout
  logout = z.strictObject({ flag: generalValidationFields.logoutFlag });
}

export const userValidationSchema = new UserValidationSchema();
