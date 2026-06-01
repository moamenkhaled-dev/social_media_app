import type { IChat } from "../../../common/interfaces/chat.interface.js";
import { Chat } from "../../database/models/chat.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class ChatRepository extends DataBaseRepository<IChat> {
  constructor() {
    super(Chat);
  }
}
