import type z from "zod";
import type { storyValidation } from "./story.validation.ts";
import type { IAuth } from "../auth/auth.js";

export type UploadStoryDto = z.infer<
  typeof storyValidation.GraphQLUploadStory
> &
  IAuth;
export type GraphQLUploadStoryDto = z.infer<
  typeof storyValidation.GraphQLUploadStory
>;

export type GetStoryDto = z.infer<typeof storyValidation.getMyStory> & IAuth;
export type GraphQLGetStoryDto = z.infer<typeof storyValidation.getMyStory>;

export type GetStoryById = z.infer<typeof storyValidation.getStoryById> & IAuth;
export type GraphQLGetStoryById = z.infer<typeof storyValidation.getStoryById>;
