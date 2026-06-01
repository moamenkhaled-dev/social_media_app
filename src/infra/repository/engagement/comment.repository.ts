import type { IComment } from "../../../common/interfaces/comment.interfaces.js";
import { Comment } from "../../database/models/comment.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class CommentRepository extends DataBaseRepository<IComment> {
  constructor() {
    super(Comment);
  }
}
