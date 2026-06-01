import { GraphQLError } from "graphql";
import type { AppError } from "./app.errors.js";

export const GQLError = (error: AppError) => {
  throw new GraphQLError(error.message, {
    extensions: { status: error.status, cause: error.cause },
  });
};
