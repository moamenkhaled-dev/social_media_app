import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type { GraphQLGetStoryDto, GraphQLUploadStoryDto, GraphQLGetStoryById } from "../story.js";
import type { HydratedDocument } from "mongoose";
import type { IStory } from "../../../common/interfaces/story.interface.js";
import { storyService } from "../story.service.js";
import { storyValidation } from "../story.validation.js";

class StoryResolver {
  private readonly storyValidation = storyValidation;
  private readonly storyService = storyService;

  //upload story
  uploadStory = async (
    parent: any,
    { content }: GraphQLUploadStoryDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLUploadStoryDto>({
      schema: this.storyValidation.GraphQLUploadStory,
      args: { content },
    });
    //service
    await this.storyService.uploadStory({
      user,
      ...validatedData,
    });

    return { message: "Story uploaded successfully" };
  };
  
  //get my story
  getMyStory = async (
    parent: any,
    { storyId }: GraphQLGetStoryDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: HydratedDocument<IStory> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLGetStoryDto>({
      schema: this.storyValidation.getMyStory,
      args: { storyId },
    });
    //service
    const story = await this.storyService.getMyStory({
      user,
      ...validatedData,
    });

    return { message: "Success", data: story };
  };

  //get story by id
  getStoryById = async (
    parent: any,
    { storyId }: GraphQLGetStoryById,
    context: IGQqlContext,
  ): Promise<{ message: string; data: HydratedDocument<IStory> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const validatedData = await GQLValidate<GraphQLGetStoryById>({
      schema: this.storyValidation.getStoryById,
      args: { storyId },
    });
    //service
    const story = await this.storyService.getStoryById({
      user,
      ...validatedData,
    });

    return { message: "Success", data: story };
  };
}

export const storyResolver = new StoryResolver();
