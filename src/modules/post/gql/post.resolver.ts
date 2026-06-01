import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type { GraphQLGetPostSchema, GraphQLPostsListDto } from "../post.js";
import { postService } from "../post.service.js";
import { postValidationSchema } from "../post.validation.js";

class PostGraphQLResolver {
  private readonly postService = postService;
  private readonly postSchema = postValidationSchema;

  //posts list
  postsList = async (
    parent: any,
    { page, limit, search, targetUserId }: GraphQLPostsListDto,
    context: IGQqlContext,
  ): Promise<any> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLPostsListDto>({
      schema: this.postSchema.postsList,
      args: { page, limit, search, targetUserId },
    });
    //service
    const { message, posts } = await this.postService.postsList({
      user,
      targetUserId,
      page,
      limit,
      search,
    });

    return { message, data: posts };
  };

  //get post by id
  getPostById = async (
    parent: any,
    { targetUserId, postId }: GraphQLGetPostSchema,
    context: IGQqlContext,
  ): Promise<any> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    await GQLValidate<GraphQLGetPostSchema>({
      schema: this.postSchema.getPostById,
      args: { targetUserId, postId },
    });
    //service
    const { message, post } = await postService.getPostById({
      user,
      targetUserId,
      postId,
    });

    return { message, data: post };
  };
}

export const postGraphQLResolver = new PostGraphQLResolver();
