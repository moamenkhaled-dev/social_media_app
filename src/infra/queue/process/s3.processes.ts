import type { Types } from "mongoose";
import { s3Service } from "../../../common/services/s3.service.js";
import { CommentRepository, PostRepository } from "../../repository/index.js";
import { StorageEnum, UploadEnum } from "../../../common/enums/s3.enums.js";
import { BadRequestError } from "../../../common/errors/client.errors.js";
import { PostStatusEnum } from "../../../common/enums/post.enums.js";


class S3Process {
  private readonly s3 = s3Service;
  private readonly postRepository: PostRepository;
  private readonly commentRepository: CommentRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.commentRepository = new CommentRepository();
  }

  //Shared Helpers
  private async uploadAssets({
    files,
    folderId,
  }: {
    files: Array<Express.Multer.File>;
    folderId: string;
  }): Promise<Array<string>> {
    const urls = await Promise.all(
      files.map(async (file) => {
        if (file.size > 5) {
          return await this.s3.uploadAssets({
            storage: StorageEnum.DISK,
            upload: UploadEnum.LARGE,
            files: [file],
            path: `Post/${folderId}`,
          });
        } else {
          return await this.s3.uploadAssets({
            storage: StorageEnum.MEMORY,
            upload: UploadEnum.SMALL,
            files: [file],
            path: `Post/${folderId}`,
          });
        }
      }),
    );

    return urls.flat();
  }

  //create post media
  async processPostMedia({
    userId,
    postId,
    folderId,
    files,
  }: {
    userId: Types.ObjectId | string;
    postId: Types.ObjectId | string;
    folderId: string;
    files: Array<Express.Multer.File>;
  }): Promise<void> {
    try {
      const urls = await this.uploadAssets({ files, folderId });
      if (urls.length <= 0) {
        throw new BadRequestError(`Fail to upload this assets`);
      }
      await this.postRepository.findOneAndUpdate({
        filter: { _id: postId, authorId: userId },
        update: { $set: { media: urls, postStatus: PostStatusEnum.PUBLISHED } },
      });
    } catch (error) {
      await this.postRepository.findOneAndUpdate({
        filter: { _id: postId, authorId: userId },
        update: { $set: { postStatus: PostStatusEnum.FAILED } },
      });

      throw error;
    }
  }

  //Update Post Media
  async processUpdatePostMedia({
    userId,
    postId,
    folderId,
    files,
    removeFiles,
  }: {
    userId: Types.ObjectId | string;
    postId: Types.ObjectId | string;
    folderId: string;
    files: Array<Express.Multer.File>;
    removeFiles: Array<string>;
  }): Promise<void> {
    try {
      const urls = await this.uploadAssets({ files, folderId });
      if (urls.length <= 0) {
        throw new BadRequestError(`Fail to upload this assets`);
      }
      await this.postRepository.findOneAndUpdate({
        filter: { _id: postId, authorId: userId },
        update: [
          {
            $set: {
              postStatus: PostStatusEnum.PUBLISHED,
              media: {
                $setUnion: [
                  {
                    $setDifference: [
                      { $ifNull: ["$media", []] },
                      removeFiles ?? [],
                    ],
                  },
                  urls,
                ],
              },
            },
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  //update comment media
  async updateCommentMedia({
    userId,
    postId,
    commentId,
    files,
    removeFiles,
    folderId,
  }: {
    postId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    commentId: Types.ObjectId | string;
    files: Array<Express.Multer.File>;
    removeFiles: Array<string>;
    folderId: string;
  }): Promise<any> {
    try {
      const urls = await this.uploadAssets({ files, folderId });
      if (urls.length <= 0) {
        throw new BadRequestError(`Fail to upload this assets`);
      }
      await this.commentRepository.findOneAndUpdate({
        filter: { _id: commentId, postId, authorId: userId },
        update: {
          $set: {
            media: {
              $setUnion: [
                {
                  $setDifference: [
                    { $ifNull: ["$media", []] },
                    removeFiles ?? [],
                  ],
                },
                urls,
              ],
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const s3Process = new S3Process();
