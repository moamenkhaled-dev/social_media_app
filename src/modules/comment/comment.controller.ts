import type { Request, Response } from "express";
import { commentService } from "./comment.service.js";
import type { Types } from "mongoose";
import { successResponse } from "../../common/responses/success.response.js";

class CommentController {
  private readonly commentService = commentService;

  //create comment
  createComment = async (req: Request, res: Response) => {
    const { content, mentions, parentCommentId } = req.body;
    const { postId } = req.params as {
      postId: string;
      parentCommentId: string;
    };
    const comment = await this.commentService.createComment({
      user: req.user,
      postId: postId as unknown as Types.ObjectId,
      parentCommentId,
      content,
      files: req.files as Array<Express.Multer.File>,
      mentions,
    });

    return successResponse({ res, status: 201, data: comment });
  };

  //update comment
  updateComment = async (req: Request, res: Response) => {
    const comment = await this.commentService.updateComment({
      user: req.user,
      files: req.files,
      ...req.body,
      ...req.params,
    });

    return successResponse({ res, data: comment });
  };
}

export const commentController = new CommentController();
