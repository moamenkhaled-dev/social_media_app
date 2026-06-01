import type { HydratedDocument, Types } from "mongoose";
import type { PostStatusEnum } from "../../common/enums/post.enums.js";
import type { PaginateType } from "../../infra/repository/base.repository.js";
import type { IPost } from "../../common/interfaces/post.interfaces.js";

//create post
export interface ICreatePostResponse {
  message: string;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  status: PostStatusEnum | undefined;
}

//posts list
export interface IPostsListResponse {
  message: string;
  posts: PaginateType<IPost> | null;
}

//get post by id
export interface IGetPostByIdResponse {
  message?: string;
  post?: IPost;
}
