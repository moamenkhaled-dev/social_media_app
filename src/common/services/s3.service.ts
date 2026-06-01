import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
  type CompleteMultipartUploadCommandOutput,
  type DeleteObjectCommandOutput,
  type DeleteObjectsCommandOutput,
  type GetObjectCommandOutput,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_EXPIRES_IN,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.js";
import { StorageEnum, UploadEnum } from "../enums/s3.enums.js";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { BadRequestError } from "../errors/client.errors.js";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalServerError } from "../errors/server.errors.js";

class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  //upload asset
  async uploadAsset({
    storage = StorageEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
  }: {
    storage?: StorageEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string | undefined;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}/${file.originalname}`,
      Body:
        storage === StorageEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ACL,
      ContentType: file.mimetype || ContentType,
    });
    if (!command.input.Key) {
      throw new BadRequestError("Fail to upload this asset");
    }
    await this.client.send(command);

    return command.input.Key;
  }

  //upload large asset
  async uploadLargeAsset({
    storage = StorageEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
    partSize = 5,
    queueSize = 4,
    leavePartsOnError = false,
  }: {
    storage?: StorageEnum | undefined;
    Bucket?: string | undefined;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL | undefined;
    ContentType?: string | undefined;
    partSize?: number | undefined;
    queueSize?: number | undefined;
    leavePartsOnError?: boolean | undefined;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket,
        Key: `${APPLICATION_NAME}/${path}/${randomUUID()}/${file.originalname}`,
        Body:
          storage === StorageEnum.MEMORY
            ? file.buffer
            : createReadStream(file.path),
        ACL,
        ContentType: file.mimetype || ContentType,
      },
      partSize: partSize * 1024 * 1024,
      queueSize,
      leavePartsOnError,
    });

    return await upload.done();

    // return (await upload.done()).Key
  }

  //upload assets
  async uploadAssets({
    storage,
    upload,
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    files,
    ACL = ObjectCannedACL.private,
    ContentType,
    partSize = 5,
    queueSize = 4,
    leavePartsOnError = false,
  }: {
    storage: StorageEnum;
    upload: UploadEnum;
    Bucket?: string;
    path?: string;
    files: Array<Express.Multer.File>;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    partSize?: number;
    queueSize?: number;
    leavePartsOnError?: boolean;
  }): Promise<Array<string>> {
    let urls: Array<string> = [];
    if (upload === UploadEnum.LARGE) {
      const data = await Promise.all(
        files.map((file) => {
          return this.uploadLargeAsset({
            storage,
            Bucket,
            path,
            file,
            ACL,
            ContentType,
            partSize: partSize * 1024 * 1024,
            queueSize,
            leavePartsOnError,
          });
        }),
      );

      urls = data.map((ele) => {
        return ele.Key as string;
      });
    } else {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadAsset({
            storage,
            Bucket,
            path,
            file,
            ACL,
            ContentType,
          });
        }),
      );
    }
    if (urls.length === 0) {
      throw new InternalServerError("Failed to upload assets");
    }

    return urls;
  }

  //get asset
  async getAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({ Bucket, Key });

    return this.client.send(command);
  }

  //create presigned upload url
  async createPreSignedUploadUrl({
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    originalname,
    ContentType,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    path?: string;
    originalname: string;
    ContentType: string;
    expiresIn?: number;
  }): Promise<{ url: string; Key: string }> {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}/${originalname}`,
      ContentType,
    });
    if (!command.input.Key) {
      throw new BadRequestError("Fail to upload this asset");
    }
    const url = await getSignedUrl(this.client, command, { expiresIn });

    return { url, Key: command.input.Key };
  }

  //create pre signed url fetch link
  async createPreSignedUrlFetchLink({
    Bucket = AWS_BUCKET_NAME,
    Key,
    fileName,
    download,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    Key: string;
    fileName?: string;
    download?: string;
    expiresIn?: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download === "true"
          ? fileName ||
            `attachment; filename="${fileName || Key.split("/").pop()}"`
          : undefined,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });

    return url;
  }

  //delete asset
  async deleteAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({ Bucket, Key });

    return await this.client.send(command);
  }

  //delete assets
  async deleteAssets({
    Bucket = AWS_BUCKET_NAME,
    Keys,
  }: {
    Bucket?: string;
    Keys: Array<{ Key: string }>;
  }): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: Keys,
        Quiet: false,
      },
    });

    return await this.client.send(command);
  }

  //list folder dir
  async listFolderDir({
    Bucket = AWS_BUCKET_NAME,
    prefix,
  }: {
    Bucket?: string;
    prefix: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${APPLICATION_NAME}/${prefix}`,
    });

    return await this.client.send(command);
  }
}

export const s3Service = new S3Service();
