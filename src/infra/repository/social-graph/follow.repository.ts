import type { IFollow } from "../../../common/interfaces/follow.interface.js";
import { Follow } from "../../database/models/follow.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class FollowRepository extends DataBaseRepository<IFollow> {
  constructor() {
    super(Follow);
  }
}
