import type { Request, Response } from "express";
import { postService } from "./post.service.js";
import { successResponse } from "../../common/responses/success.response.js";
import type { Types } from "mongoose";

class PostController {
  private postService = postService;

  //create post
  async createPost(req: Request, res: Response) {
    const { content, postVisibility, tags } = req.body;
    const result = await this.postService.createPost({
      user: req.user,
      content,
      files: req.files as Array<Express.Multer.File> | undefined,
      postVisibility,
      tags,
    });

    return successResponse({ res, status: 201, data: result });
  }

  //update post
  async updatePost(req: Request, res: Response) {
    const { content, postVisibility, tags, removeTags, removeFiles } = req.body;
    const { postId } = req.params as { postId: string };
    const result = await this.postService.updatePost({
      user: req.user,
      postId: postId as unknown as Types.ObjectId,
      content,
      files: req.files as Array<Express.Multer.File> | undefined,
      postVisibility,
      tags,
      removeTags,
      removeFiles,
    });

    return successResponse({ res, status: 200, data: result });
  }

  //posts list
  async postsList(req: Request, res: Response) {
    const { page, limit, search } = req.query as {
      page: string;
      limit: string;
      search: string;
    };
    const { targetUserId } = req.params as { targetUserId: string };
    const result = await this.postService.postsList({
      user: req.user,
      targetUserId: targetUserId as unknown as Types.ObjectId,
      page: page as unknown as number,
      limit: limit as unknown as number,
      search,
    });

    return successResponse({ res, status: 200, data: result });
  }
}

export const postController = new PostController();
