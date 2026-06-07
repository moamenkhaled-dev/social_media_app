import type { IModerationCase } from "../../../common/interfaces/moderationCase.interface.js";
import { ModerationCase } from "../../database/models/moderationCase.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class ModerationCaseRepository extends DataBaseRepository<IModerationCase> {
  constructor() {
    super(ModerationCase);
  }
}
