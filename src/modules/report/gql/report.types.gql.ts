import { GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class ReportGraphQLType {
  private readonly graphType = graphQLTypes;

  //report
  report = new GraphQLObjectType({
    name: "reportType",
    fields: { message: { type: this.graphType.messageType } },
  });

  //open report
  openReport = new GraphQLObjectType({
    name: "openReportType",
    fields: {
      message: { type: this.graphType.messageType },
      data: { type: this.graphType.oneReportType },
    },
  });

  //open moderation case
  openModerationCase = new GraphQLObjectType({
    name: "openModerationCaseType",
    fields: {
      message: { type: this.graphType.messageType },
      data: { type: this.graphType.oneModerationCaseType },
    },
  });

  //take action for moderation case
  takeActionForModerationCase = new GraphQLObjectType({
    name: "takeActionForModerationCase",
    fields: {
      message: { type: this.graphType.messageType },
    },
  });
}

export const reportGraphQLType = new ReportGraphQLType();
