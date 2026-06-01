import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";

class CommentValidationSchema {
  //create comment
  createComment = {
    body: z
      .strictObject({
        content: generalValidationFields.nullString.optional(),
        files: generalValidationFields
          .files([...fileFilterValidation.image])
          .optional(),
        mentions: generalValidationFields.arrayIDs.optional(),
        parentCommentId: generalValidationFields.id.optional(),
      })
      .superRefine((fields, ctx) => {
        if (fields.mentions && fields.mentions.length) {
          const uniqueTags = [...new Set(fields.mentions)];
          if (uniqueTags.length !== fields.mentions.length) {
            ctx.addIssue({
              code: "custom",
              path: ["mentions"],
              message: "Mentions must be unique",
            });
          }
        }

        if (!fields.content && !fields.files?.length) {
          ctx.addIssue({
            code: "custom",
            path: ["content"],
            message: "empty comment",
          });
        }
      }),
    params: z.strictObject({
      postId: generalValidationFields.id,
    }),
  };

  //update comment
  updateComment = {
    params: z.strictObject({
      postId: generalValidationFields.id,
      commentId: generalValidationFields.id,
    }),
    body: z
      .strictObject({
        content: generalValidationFields.nullString.optional(),
        files: generalValidationFields
          .files(fileFilterValidation.image)
          .optional(),
        mentions: generalValidationFields.arrayIDs.optional(),
        removeFiles: generalValidationFields.arrayStrings.optional(),
        removeMentions: generalValidationFields.arrayIDs.optional(),
      })
      .superRefine((fields, ctx) => {
        if (fields.mentions && fields.mentions.length) {
          const uniqueMentions = [...new Set(fields.mentions)];
          if (fields.mentions.length !== uniqueMentions.length) {
            ctx.addIssue({
              code: "custom",
              path: ["mentions"],
              message: "Invalid mentions account",
            });
          }
        }

        if (fields.removeMentions && fields.removeMentions.length) {
          const uniqueRemoveMentions = [...new Set(fields.removeMentions)];
          if (fields.removeMentions.length !== uniqueRemoveMentions.length) {
            ctx.addIssue({
              code: "custom",
              path: ["removeMentions"],
              message: "Invalid remove mentions account",
            });
          }
        }
      }),
  };

  //get comment
  getComment = z.strictObject({ commentId: generalValidationFields.id });

  //comments list of post
  commentsListOfPost = z
    .strictObject({
      postId: generalValidationFields.id,
    })
    .extend(PaginateValidation.shape);
}

export const commentValidationSchema = new CommentValidationSchema();
