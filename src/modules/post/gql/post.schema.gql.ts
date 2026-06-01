import { postGraphQLArgs } from "./post.args.gql.js";
import { postGraphQLResolver } from "./post.resolver.js";
import { postGraphQLType } from "./post.type.gql.js";

class PostGraphQLSchema {
  private readonly postType = postGraphQLType;
  private readonly postArgs = postGraphQLArgs;
  private readonly postResolver = postGraphQLResolver;

  //posts list
  registerQuery() {
    return {
      //posts list
      postList: {
        description: "posts list query schema",
        type: this.postType.postsList,
        args: this.postArgs.postsList,
        resolve: this.postResolver.postsList,
      },

      //get post by id
      getPostById: {
        description: "get post by id query schema",
        type: this.postType.getPostById,
        args: this.postArgs.getPostById,
        resolve: this.postResolver.getPostById,
      },
    };
  }
}

export const postGraphQLSchema = new PostGraphQLSchema();
