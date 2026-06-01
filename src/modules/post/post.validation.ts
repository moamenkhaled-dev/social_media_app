import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { PostVisibilityEnum } from "../../common/enums/post.enums.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";

class PostValidationSchema {
  //post body
  private readonly postBody = z
    .strictObject({
      content: generalValidationFields.nullString.optional(),
      files: generalValidationFields
        .files([...fileFilterValidation.image, ...fileFilterValidation.video])
        .optional(),
      postVisibility: generalValidationFields.postVisibility
        .default(PostVisibilityEnum.PUBLIC)
        .optional(),
      tags: generalValidationFields.arrayIDs.optional(),
    })
    .superRefine((fields, ctx) => {
      if (!fields.content && !fields.files) {
        ctx.addIssue({
          code: "custom",
          path: ["content and media"],
          message: "Empty post",
        });
      }

      if (fields.tags?.length) {
        const uniqueTags = [...new Set(fields.tags)];
        if (uniqueTags.length !== fields.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Tags must be unique",
          });
        }
      }
    });

  //create post
  createPost = {
    body: this.postBody,
  };

  //update post
  updatePost = {
    params: z.strictObject({
      postId: generalValidationFields.id,
    }),
    body: this.postBody.safeExtend({
      removeTags: generalValidationFields.arrayIDs.optional(),
      removeFiles: generalValidationFields.arrayStrings.optional(),
    }),
  };

  //posts list
  postsList = z
    .strictObject({
      targetUserId: generalValidationFields.id,
    })
    .extend(PaginateValidation.shape);

  //get post by id
  getPostById = z.strictObject({
    postId: generalValidationFields.id,
    targetUserId: generalValidationFields.id,
  });
}

export const postValidationSchema = new PostValidationSchema();
