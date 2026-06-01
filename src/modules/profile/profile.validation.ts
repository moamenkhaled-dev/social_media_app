import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

class ProfileValidationSchema {
  //get profile by id
  getProfileById = z.strictObject({
    targetId: generalValidationFields.id,
  });
}

export const profileValidationSchema = new ProfileValidationSchema();
