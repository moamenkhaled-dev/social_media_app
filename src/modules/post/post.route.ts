import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import { restFullApiValidate } from "../../middlewares/validation.middleware.js";
import { postValidationSchema } from "./post.validation.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { StorageEnum } from "../../common/enums/s3.enums.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { postController } from "./post.controller.js";

const router = Router();

//create post
router.post(
  "/create",
  authentication(),
  cloudFileUpload({
    storageType: StorageEnum.DISK,
    validation: [...fileFilterValidation.image, ...fileFilterValidation.video],
  }).array("attachments", 5),
  restFullApiValidate(postValidationSchema.createPost),
  postController.createPost.bind(postController),
);

//update post
router.put(
  "/:postId",
  authentication(),
  cloudFileUpload({
    storageType: StorageEnum.DISK,
    validation: [...fileFilterValidation.image, ...fileFilterValidation.video],
  }).array("attachments", 5),
  restFullApiValidate(postValidationSchema.updatePost),
  postController.updatePost.bind(postController),
);

router.get(
  "/:targetUserId",
  authentication(),
  postController.postsList.bind(postController),
);

export default router;
