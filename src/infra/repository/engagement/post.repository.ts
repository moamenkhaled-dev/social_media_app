import type { IPost } from "../../../common/interfaces/post.interfaces.js";
import { Post } from "../../database/models/post.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class PostRepository extends DataBaseRepository<IPost> {
  constructor() {
    super(Post);
  }
}
