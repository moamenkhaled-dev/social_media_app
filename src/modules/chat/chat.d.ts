import type z from "zod";
import type { chatValidation } from "./chat.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type SendOVOMessageDto = z.infer<typeof chatValidation.sendOVOMessage> &
  IAuth;
export type SocketSendOVOMessageDto = z.infer<
  typeof chatValidation.sendOVOMessage
>;

export type GetOVOChatDto = z.infer<typeof chatValidation.getOVOChat> & IAuth;
export type GraphQLGetOVOChatDto = z.infer<typeof chatValidation.getOVOChat>;

export type GetChatMessagesDto = z.infer<typeof chatValidation.getOVOMessages> &
  IAuth;
export type GraphQLGetChatMessagesDto = z.infer<
  typeof chatValidation.getOVOMessages
>;

export type RestFullAPICreateGroupDto = z.infer<
  typeof chatValidation.createGroup.body
> &
  IAuth;

export type SendOVMMessagesDto = z.infer<
  typeof chatValidation.sendOVMMessages
> &
  IAuth;
export type SocketSendOVMMessagesDto = z.infer<
  typeof chatValidation.sendOVMMessages
>;
