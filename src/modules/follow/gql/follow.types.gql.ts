import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class FollowGraphQLType {
  private readonly graphQLType = graphQLTypes;
  //follow user
  follow = new GraphQLObjectType({
    name: "followUserType",
    fields: {
      message: { type: this.graphQLType.messageType },
      data: { type: new GraphQLNonNull(GraphQLString) },
    },
  });

  //un follow user
  unFollow = new GraphQLObjectType({
    name: "unFollowUserType",
    fields: {
      message: { type: this.graphQLType.messageType },
    },
  });

  //follow request
  followRequest = new GraphQLObjectType({
    name: "followRequestType",
    fields: {
      message: { type: this.graphQLType.messageType },
    },
  });

  //followers list
  followersList = new GraphQLObjectType({
    name: "followersListType",
    fields: {
      message: { type: this.graphQLType.messageType },
      data: { type: new GraphQLList(this.graphQLType.oneFollowersListType) },
    },
  });
}

export const followGraphQLType = new FollowGraphQLType();
