import type z from "zod";
import type { postValidationSchema } from "./post.validation.ts";
import type { IAuth } from "../auth/auth.js";
import type { PaginateDto } from "../../common/validation/paginate.validation.ts";

export type CreatePostDto = z.infer<
  typeof postValidationSchema.createPost.body
> &
  IAuth;

type UpdatePostParams = z.infer<typeof postValidationSchema.updatePost.params>;
type UpdatePostBodyDto = z.infer<typeof postValidationSchema.updatePost.body>;
export type UpdatePostDto = UpdatePostParams & UpdatePostBodyDto & IAuth;

export type PostsListDto = z.infer<typeof postValidationSchema.postsList> &
  IAuth;

export type GraphQLPostsListDto = z.infer<
  typeof postValidationSchema.postsList
>;

export type GetPostDto = z.infer<typeof postValidationSchema.getPostById> &
  IAuth;
export type GraphQLGetPostSchema = z.infer<
  typeof postValidationSchema.getPostById
>;
