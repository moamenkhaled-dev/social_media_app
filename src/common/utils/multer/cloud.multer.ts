import multer from "multer";
import { StorageEnum } from "../../enums/s3.enums.js";
import type { Request } from "express";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { fileFilter } from "./validation.js";

export const cloudFileUpload = ({
  storageType = StorageEnum.MEMORY,
  validation,
  maxSize = 5,
}: {
  storageType?: StorageEnum;
  validation: Array<string>;
  maxSize?: number;
}): multer.Multer => {
  const storage =
    storageType === StorageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          //destination
          destination(
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ): void {
            callback(null, tmpdir());
          },

          //filename
          filename(
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, filename: string) => void,
          ): void {
            const fileName = `${randomUUID()}_${file.originalname}`;
            callback(null, fileName);
          },
        });

  return multer({
    fileFilter: fileFilter(validation),
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
};
