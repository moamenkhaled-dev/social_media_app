import type { ISettings } from "../../../common/interfaces/settings.interfaces.js";
import { Settings } from "../../database/models/settings.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class SettingsRepository extends DataBaseRepository<ISettings> {
  constructor() {
    super(Settings);
  }
}
