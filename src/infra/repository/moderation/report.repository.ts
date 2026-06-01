import type { IReport } from "../../../common/interfaces/report.interfaces.js";
import { Report } from "../../database/models/report.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class ReportRepository extends DataBaseRepository<IReport> {
  constructor() {
    super(Report);
  }
}
