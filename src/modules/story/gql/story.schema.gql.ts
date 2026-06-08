import { storyGraphQLType } from "./story.types.gql.js";
import { storyGraphQLArgs } from "./story.args.gql.js";
import { storyResolver } from "./story.resolver.js";

class StoryGraphQLSchema {
  private readonly storyGraphQLType = storyGraphQLType;
  private readonly storyGraphQLArgs = storyGraphQLArgs;
  private readonly storyResolver = storyResolver;

  //query
  registerQuery() {
    return {
      //get my story
      getMyStory: {
        description: "get my story",
        type: this.storyGraphQLType.getMyStory,
        args: this.storyGraphQLArgs.getMyStory,
        resolve: this.storyResolver.getMyStory,
      },

      //get story by id
      getStoryById: {
        description: "get story by id",
        type: this.storyGraphQLType.getStoryById,
        args: this.storyGraphQLArgs.getStoryById,
        resolve: this.storyResolver.getStoryById,
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      //upload story
      uploadStory: {
        description: "upload story",
        type: this.storyGraphQLType.uploadStory,
        args: this.storyGraphQLArgs.uploadStory,
        resolve: this.storyResolver.uploadStory,
      },
    };
  }
}

export const storyGraphQLSchema = new StoryGraphQLSchema();
