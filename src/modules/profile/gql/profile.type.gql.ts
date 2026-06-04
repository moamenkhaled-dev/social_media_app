import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";

class ProfileGraphQLType {
  private readonly graphQLTypes = graphQLTypes;

  //profile
  profile = new GraphQLObjectType({
    name: "ProfileGraphQlType",
    fields: {
      data: {
        type: new GraphQLObjectType({
          name: "profileGraphQLDataType",
          fields: {
            profile: { type: this.graphQLTypes.oneProfileType },
            stats: { type: this.graphQLTypes.oneStatsType },
            email: { type: GraphQLString },
            phone: { type: GraphQLString },
          },
        }),
      },
    },
  });

  //get profile by id
  getProfileById = new GraphQLObjectType({
    name: "getProfileByIdType",
    fields: {
      data: {
        type: new GraphQLObjectType({
          name: "getProfileByIdTypeData",
          fields: {
            profile: { type: this.graphQLTypes.oneProfileType },
            stats: { type: new GraphQLNonNull(this.graphQLTypes.oneStatsType) },
            email: { type: GraphQLString },
            phone: { type: GraphQLString },
            lastSeenAt: { type: GraphQLString },
          },
        }),
      },
    },
  });

  //get stats
  getStats = new GraphQLObjectType({
    name: "getStatsType",
    fields: {
      message: { type: this.graphQLTypes.messageType },
      data: { type: this.graphQLTypes.oneStatsType },
    },
  });
}

export const profileGraphQLType = new ProfileGraphQLType();
