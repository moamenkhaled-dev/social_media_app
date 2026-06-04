import type { IGQqlContext } from "../../../common/types/gql.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import type { IBlockListResponse } from "../block.entity.js";
import type {
  GraphQLBlockDto,
  GraphQLBlockListDto,
  GraphQLUnBlockDto,
} from "../block.js";
import { blockService } from "../block.service.js";
import { blockValidation } from "../block.validation.js";

class BlockResolver {
  private readonly blockValidation = blockValidation;
  private readonly blockService = blockService;

  //block
  block = async (
    parent: any,
    { targetUserId }: GraphQLBlockDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const verifiedData = await GQLValidate<GraphQLBlockDto>({
      schema: this.blockValidation.block,
      args: { targetUserId },
    });
    //service
    await this.blockService.block({ user, ...verifiedData });

    return { message: "Success" };
  };

  //un block
  unBlock = async (
    parent: any,
    { targetUserId }: GraphQLUnBlockDto,
    context: IGQqlContext,
  ): Promise<{ message: string }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const verifiedData = await GQLValidate<GraphQLUnBlockDto>({
      schema: this.blockValidation.block,
      args: { targetUserId },
    });
    //service
    await this.blockService.unBlock({ user, ...verifiedData });

    return { message: "Success" };
  };

  //block list
  blockList = async (
    parent: any,
    { page, limit, search }: GraphQLBlockListDto,
    context: IGQqlContext,
  ): Promise<{ message: string; data: Array<IBlockListResponse> }> => {
    //authentication
    const { user } = await GQLAuthentication({ context });
    //validation
    const verifiedData = await GQLValidate<GraphQLBlockListDto>({
      schema: this.blockValidation.blockList,
      args: { page, limit, search },
    });
    //service
    const blockList = await this.blockService.blockList({
      user,
      ...verifiedData,
    });

    return { message: "Success", data: blockList };
  };
}

export const blockResolver = new BlockResolver();
