import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import {
  GraphQLReportActionEnum,
  GraphQLReportReasonEnum,
  GraphQLReportStatusEnum,
  GraphQLReportTargetTypeEnum,
} from "../../../common/enums/gql.enums.js";

class ReportGraphQLArgs {
  //report
  report = {
    targetId: { type: new GraphQLNonNull(GraphQLID) },
    targetType: { type: new GraphQLNonNull(GraphQLReportTargetTypeEnum) },
    reason: { type: new GraphQLNonNull(GraphQLReportReasonEnum) },
    customReason: { type: GraphQLString },
    snapshot: { type: GraphQLString },
  };

  //open report
  openReport = { reportId: { type: new GraphQLNonNull(GraphQLID) } };

  //open moderation case
  openModerationCase = {
    moderationCaseId: { type: new GraphQLNonNull(GraphQLID) },
  };

  //take action for moderation case
  takeActionForModerationCase = {
    moderationCaseId: { type: new GraphQLNonNull(GraphQLID) },
    action: { type: GraphQLReportActionEnum },
    customAction: { type: GraphQLString },
    status: { type: new GraphQLNonNull(GraphQLReportStatusEnum) },
  };
}

export const reportGraphQLArgs = new ReportGraphQLArgs();
