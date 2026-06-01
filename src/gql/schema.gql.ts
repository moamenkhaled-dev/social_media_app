import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { authGraphQlSchema } from "../modules/auth/gql/auth.schema.gql.js";
import { notificationGraphQLSchema } from "../modules/notification/gql/notification.schema.gql.js";
import { userGraphQLSchema } from "../modules/index.js";
import { profileGraphQLSchema } from "../modules/profile/gql/profile.schema.gql.js";
import { postGraphQLSchema } from "../modules/post/gql/post.schema.gql.js";
import { commentGraphQLSchema } from "../modules/comment/index.js";
import { chatGraphQLSchema } from "../modules/chat/gql/chat.schema.gql.js";

const query = new GraphQLObjectType({
  name: "query",
  description: "graphQl Query",
  fields: {
    ...notificationGraphQLSchema.registerQuery(),
    ...profileGraphQLSchema.registerQuery(),
    ...commentGraphQLSchema.registerQuery(),
    ...userGraphQLSchema.registerQuery(),
    ...postGraphQLSchema.registerQuery(),
    ...chatGraphQLSchema.registerQuery(),
  },
});

const mutation = new GraphQLObjectType({
  name: "mutation",
  description: "graphQl mutation",
  fields: {
    ...authGraphQlSchema.registerMutation(),
    ...userGraphQLSchema.registerMutation(),
    ...profileGraphQLSchema.registerMutation(),
  },
});

export const schema = new GraphQLSchema({ query, mutation });
