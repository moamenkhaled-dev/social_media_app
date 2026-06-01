import type z from "zod";
import type { commentValidationSchema } from "./comment.validation.ts";
import type { IAuth } from "../auth/auth.js";
import type { PaginateDto } from "../../common/validation/paginate.validation.ts";

type CreateCommentParamsDto = z.infer<
  typeof commentValidationSchema.createComment.params
>;
type CreateCommentBodyDto = z.infer<
  typeof commentValidationSchema.createComment.body
>;
export type CreateCommentDto = IAuth &
  CreateCommentParamsDto &
  CreateCommentBodyDto;

type UpdateCommentParamsDto = z.infer<
  typeof commentValidationSchema.updateComment.params
>;
type UpdateCommentBodyDto = z.infer<
  typeof commentValidationSchema.updateComment.body
>;

export type UpdateCommentDto = IAuth &
  UpdateCommentParamsDto &
  UpdateCommentBodyDto;

export type GetCommentDto = z.infer<typeof commentValidationSchema.getComment>;

export type CommentsListDto = z.infer<
  typeof commentValidationSchema.commentsListOfPost
> &
  PaginateDto;
