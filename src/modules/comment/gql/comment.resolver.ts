import type { IComment } from "../../../common/interfaces/comment.interfaces.js";
import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type { ICommentsListResponse } from "../comment.entity.js";
import type { CommentsListDto, GetCommentDto } from "../comment.js";
import { commentService } from "../comment.service.js";
import { commentValidationSchema } from "../comment.validation.js";

class GraphQLCommentResolver {
  private readonly commentValidation = commentValidationSchema;
  private readonly commentService = commentService;

  //get comment
  getComment = async (
    parent: any,
    { commentId }: GetCommentDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: IComment }> => {
    //authentication
    await GQLAuthentication({ context });
    //validation
    await GQLValidate<GetCommentDto>({
      schema: this.commentValidation.getComment,
      args: { commentId },
    });
    //service
    const comment = await this.commentService.getComment({ commentId });

    return { message: `Success`, data: comment };
  };

  //comments list
  commentsList = async (
    parent: any,
    { postId, page, limit }: CommentsListDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: ICommentsListResponse | null }> => {
    //authentication
    await GQLAuthentication({ context });
    //validation
    await GQLValidate<CommentsListDto>({
      schema: this.commentValidation.commentsListOfPost,
      args: { postId, page, limit },
    });
    //service
    const comments = await this.commentService.commentsListOfPost({
      postId,
      page,
      limit,
    });

    return { message: `Success`, data: comments };
  };
}

export const graphQLCommentResolver = new GraphQLCommentResolver();
