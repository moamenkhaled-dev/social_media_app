import { GraphQLString } from "graphql";
import { reportGraphQLArgs } from "./report.args.gql.js";
import { reportResolver } from "./report.resolver.js";
import { reportGraphQLType } from "./report.types.gql.js";

class ReportGraphQLSchema {
  private readonly reportType = reportGraphQLType;
  private readonly reportArgs = reportGraphQLArgs;
  private readonly reportResolver = reportResolver;

  //query
  registerQuery() {
    return {
      //open report
      openReport: {
        description: `get report by id report`,
        type: this.reportType.openReport,
        args: this.reportArgs.openReport,
        resolve: this.reportResolver.openReport,
      },

      //open moderation case
      openModerationCase: {
        description: `get moderation case by id report`,
        type: this.reportType.openModerationCase,
        args: this.reportArgs.openModerationCase,
        resolve: this.reportResolver.openModerationCase,
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      //report
      report: {
        description: `create report`,
        type: this.reportType.report,
        args: this.reportArgs.report,
        resolve: this.reportResolver.report,
      },

      //take action for moderation case
      takeActionForModerationCase: {
        description: `admin take action for moderation case`,
        type: this.reportType.takeActionForModerationCase,
        args: this.reportArgs.takeActionForModerationCase,
        resolve: this.reportResolver.takeActionForModerationCase,
      },
    };
  }
}

export const reportGraphQLSchema = new ReportGraphQLSchema();
