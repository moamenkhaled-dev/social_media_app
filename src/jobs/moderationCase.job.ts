import cron from "node-cron";
import { ModerationCaseRepository } from "../infra/repository/index.js";
import { ReportStatusEnum } from "../common/enums/report.enums.js";
import { redisService } from "../common/services/redis.service.js";

const moderationCase = new ModerationCaseRepository();

//convert under review moderation cases to pending
export const convertUnderReviewModerationCasesToPending = async () => {
  cron.schedule(`*/5 * * * *`, async () => {
    const time = new Date(Date.now() - 30 * 60 * 1000);
    const cases = await moderationCase.find({
      filter: {
        status: ReportStatusEnum.UNDER_REVIEW,
        reviewedAt: { $lte: time },
      },
      projection: "_id",
    });
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
    await Promise.all([
      await redisService.incrementModerationCaseVersion({}),
      cases.map((c) =>
        redisService.incrementModerationCaseVersion({
          moderationCaseId: c._id,
        }),
      ),
    ]);
  });
};
