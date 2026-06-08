import { GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class StoryGraphQLType {
  private readonly graphQLType = graphQLTypes;

  //upload story
  uploadStory = new GraphQLObjectType({
    name: "uploadStoryType",
    fields: {
      message: { type: this.graphQLType.messageType },
    },
  });

  //get my story
  getMyStory = new GraphQLObjectType({
    name: "getMyStoryType",
    fields: {
      message: { type: this.graphQLType.messageType },
      data: { type: this.graphQLType.oneStoryType },
    },
  });

  //get story by id
  getStoryById = new GraphQLObjectType({
    name: "getStoryByIdType",
    fields: {
      message: { type: this.graphQLType.messageType },
      data: { type: this.graphQLType.oneStoryType },
    },
  });
}

export const storyGraphQLType = new StoryGraphQLType();
