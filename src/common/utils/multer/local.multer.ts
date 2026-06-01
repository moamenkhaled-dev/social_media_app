import multer from "multer";
import type { Request } from "express";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileFilter } from "./validation.js";

export const localFileUpload = ({
  customPath,
  validation,
  maxSize = 5,
}: {
  customPath: string;
  validation: Array<string>;
  maxSize?: number;
}): any => {
  const storage = multer.diskStorage({
    destination(
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void,
    ): void | undefined {
      const fullPath = resolve(`../uploads/${customPath}`);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }

      callback(null, fullPath);
    },

    filename(
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ): void {
      const uniqueName = `${randomUUID()}_${file.originalname}`;
      file.finalPath = `../uploads/${customPath}/${uniqueName}`;

      callback(null, uniqueName);
    },
  });

  return multer({
    fileFilter: fileFilter(validation),
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
};
