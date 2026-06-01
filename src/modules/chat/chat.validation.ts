import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { toObjectId } from "../../common/objectId.js";
import { BadRequestError } from "../../common/errors/client.errors.js";
import { MAX_COUNTS } from "../../common/constants/cache.constants.js";

class ChatValidation {
  //send OVO message
  sendOVOMessage = z.strictObject({
    content: generalValidationFields.string(1, 4000),
    sendTo: generalValidationFields.id,
  });

  //get OVO chat
  getOVOChat = z.strictObject({
    chatId: generalValidationFields.id,
  });

  //get OVO messages
  getOVOMessages = z
    .strictObject({
      chatId: generalValidationFields.id,
      cursor: generalValidationFields.id.optional(),
    })
    .extend(PaginateValidation.shape);

  //create group
  createGroup = {
    body: z
      .strictObject({
        participants: generalValidationFields.arrayIDs.transform((v) =>
          v.map((participant) => toObjectId(participant)),
        ),
        groupName: generalValidationFields.string(1, 50),
        file: generalValidationFields
          .file(fileFilterValidation.image, 5)
          .optional(),
      })
      .superRefine((fields, ctx) => {
        const uniqueParticipants = [...new Set(fields.participants)];
        if (fields.participants.length !== uniqueParticipants.length) {
          throw new BadRequestError(`Repeated participants`);
        }
        if (fields.participants.length > MAX_COUNTS.GROUP_PARTICIPANTS) {
          throw new BadRequestError(`participants count can't exceed 1000`);
        }
      }),
  };

  //get OVM messages
  getOVMMessages = z
    .strictObject({
      chatId: generalValidationFields.id,
      cursor: generalValidationFields.id.optional(),
    })
    .extend(PaginateValidation.shape);

  //send OVM messages
  sendOVMMessages = z.strictObject({
    chatId: generalValidationFields.id,
    content: generalValidationFields.string(1, 50),
  });
}

export const chatValidation = new ChatValidation();
