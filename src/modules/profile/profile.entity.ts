import type { HydratedDocument } from "mongoose";
import type { IProfile } from "../../common/interfaces/profile.interfaces.js";
import type { IStats } from "../../common/interfaces/stats.interfaces.js";

export interface IProfileResponse {
  profile: HydratedDocument<IProfile>;
  stats: HydratedDocument<IStats>;
  email: string;
  phone: string | undefined;
}
