import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

class StoryValidation {
  //upload story
  GraphQLUploadStory = z.strictObject({
    content: generalValidationFields.string(1, 100),
  });

  //get my story
  getMyStory = z.strictObject({ storyId: generalValidationFields.id });

  //get story by id
  getStoryById = z.strictObject({
    storyId: generalValidationFields.id,
  });
}

export const storyValidation = new StoryValidation();
