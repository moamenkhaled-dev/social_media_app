import type { IStory } from "../../../common/interfaces/story.interface.js";
import { Story } from "../../database/models/story.model.js";
import { DataBaseRepository } from "../base.repository.js";

export class StoryRepository extends DataBaseRepository<IStory> {
  constructor() {
    super(Story);
  }
}
