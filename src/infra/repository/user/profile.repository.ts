import type { HydratedDocument, Types } from "mongoose";
import type { IProfile } from "../../../common/interfaces/profile.interfaces.js";
import { Profile } from "../../database/models/profile.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class ProfileRepository extends DataBaseRepository<IProfile> {
  constructor() {
    super(Profile);
  }

  //find profile by ownerId
  async findProfileByOwnerId(
    ownerId: Types.ObjectId,
  ): Promise<HydratedDocument<IProfile> | null> {
    return await this.findById({ id: ownerId });
  }
}
