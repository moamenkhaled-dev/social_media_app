import type { IMessage } from "../../../common/interfaces/message.interface.js";
import { Message } from "../../database/models/message.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class MessageRepository extends DataBaseRepository<IMessage> {
  constructor() {
    super(Message);
  }
}
