import {
  CommentRepository,
  DataBaseRepository,
  PostRepository,
  UserRepository,
} from "../../infra/repository/index.js";
import { ChatRepository } from "../../infra/repository/messaging/chat.repository.js";
import { MessageRepository } from "../../infra/repository/messaging/message.repository.js";
import type { ReportTargetTypeEnum } from "../enums/report.enums.js";

const userRepository = new UserRepository();
const chatRepository = new ChatRepository();
const postRepository = new PostRepository();
const messageRepository = new MessageRepository();
const commentRepository = new CommentRepository();

export type ReportTargetRepository = DataBaseRepository<any, any>;

export const REPORT_TARGET_MAP: Record<
  ReportTargetTypeEnum,
  ReportTargetRepository
> = {
  User: userRepository,
  Post: postRepository,
  Comment: commentRepository,
  Message: messageRepository,
  Chat: chatRepository,
};
