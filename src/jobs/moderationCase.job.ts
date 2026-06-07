import cron from "node-cron";
import { ModerationCaseRepository } from "../infra/repository/index.js";
import { ReportStatusEnum } from "../common/enums/report.enums.js";

const moderationCase = new ModerationCaseRepository();

//convert under review moderation cases to pending
export const convertUnderReviewModerationCasesToPending = async () => {
  cron.schedule(`*/5 * * * *`, async () => {
    const time = new Date(Date.now() - 30 * 60 * 1000);
    await moderationCase.updateMany({
      filter: {
        status: ReportStatusEnum.UNDER_REVIEW,
        reviewedAt: { $lte: time },
      },
      update: {
        $set: { status: ReportStatusEnum.PENDING },
        $unset: { reviewedAt: 1 },
      },
    });
  });
};
