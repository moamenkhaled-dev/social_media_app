import type { Request } from "express";
import type { FileFilterCallback } from "multer";
import { BadRequestError } from "../../errors/index.js";
import mime from "mime-types";

export const fileFilterValidation = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
};

export const fileFilter = (validation: string[]) => {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    const mimetype = mime.lookup(file.originalname) || file.mimetype;

    if (!validation.includes(mimetype)) {
      return callback(
        new BadRequestError(
          `invalid file format the allowed formats are ${validation.join(", ")} only`,
        ),
      );
    }

    return callback(null, true);
  };
};
