import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { restFullApiValidate } from "../../middlewares/validation.middleware.js";
import { chatValidation } from "./chat.validation.js";
import { chatController } from "./chat.controller.js";

const router = Router();

//create group
router.post(
  "/create-group",
  authentication(),
  cloudFileUpload({ validation: fileFilterValidation.image }).single(
    "attachment",
  ),
  restFullApiValidate(chatValidation.createGroup),
  chatController.createGroup.bind(chatController),
);

export default router;
