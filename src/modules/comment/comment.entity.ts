import type { HydratedDocument } from "mongoose";
import type { IComment } from "../../common/interfaces/comment.interfaces.js";
import type { PaginateMetaType } from "../../infra/repository/base.repository.js";

export interface ICommentsListResponse {
  data: Array<HydratedDocument<IComment>>;
  meta: PaginateMetaType;
}
