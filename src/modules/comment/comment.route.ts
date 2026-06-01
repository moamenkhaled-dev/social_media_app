import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import { restFullApiValidate } from "../../middlewares/validation.middleware.js";
import { commentValidationSchema } from "./comment.validation.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { commentController } from "./comment.controller.js";

const router = Router();

//create comment
router.post(
  "/create/:postId",
  authentication(),
  cloudFileUpload({ validation: fileFilterValidation.image }).array(
    "attachments",
    5,
  ),
  restFullApiValidate(commentValidationSchema.createComment),
  commentController.createComment.bind(commentController),
);

//update
router.put(
  "/:postId/:commentId",
  authentication(),
  cloudFileUpload({ validation: [...fileFilterValidation.image] }).array(
    "attachments",
    5,
  ),
  restFullApiValidate(commentValidationSchema.updateComment),
  commentController.updateComment.bind(commentController),
);

export default router;
