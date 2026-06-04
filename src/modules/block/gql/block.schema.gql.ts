import { GraphQLString } from "graphql";
import { blockGraphQLArgs } from "./block.args.gql.js";
import { blockGraphQLType } from "./block.types.gql.js";
import { blockResolver } from "./block.resolver.js";

class BlockGraphQLSchema {
  private readonly blockType = blockGraphQLType;
  private readonly blockArgs = blockGraphQLArgs;
  private readonly blockResolver = blockResolver;

  //query
  registerQuery() {
    return {
      //block list
      blockList: {
        description: "block list of current user",
        args: this.blockArgs.blockList,
        type: this.blockType.blockList,
        resolve: this.blockResolver.blockList,
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      //block
      block: {
        description: "block",
        args: this.blockArgs.block,
        type: this.blockType.block,
        resolve: this.blockResolver.block,
      },

      //un block
      unBlock: {
        description: "un block",
        args: this.blockArgs.block,
        type: this.blockType.block,
        resolve: this.blockResolver.unBlock,
      },
    };
  }
}

export const blockGraphQLSchema = new BlockGraphQLSchema();
