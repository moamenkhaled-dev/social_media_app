import { DataBaseRepository } from "../base.repository.js";
import type { IStats } from "../../../common/interfaces/stats.interfaces.js";
import { Stats } from "../../database/models/stats.model.js";

export class StatsRepository extends DataBaseRepository<IStats> {
  constructor() {
    super(Stats);
  }
}
