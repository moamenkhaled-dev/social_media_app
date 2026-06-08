import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";

class StoryGraphQLArgs {
  //upload story
  uploadStory = { content: { type: new GraphQLNonNull(GraphQLString) } };

  //get my story
  getMyStory = { storyId: { type: new GraphQLNonNull(GraphQLID) } };

  //get story by id
  getStoryById = { storyId: { type: new GraphQLNonNull(GraphQLID) } };
}

export const storyGraphQLArgs = new StoryGraphQLArgs();
