import type { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import {
  BadRequestError,
  ValidationError,
} from "../common/errors/client.errors.js";
import { GQLError } from "../common/errors/gql.errors.js";

type keyOfReq = keyof Request;
type SchemaType = Partial<Record<keyOfReq, ZodType>>;
type IssuesType = Array<{
  key: keyOfReq;
  issues: Array<{
    message: string;
    path: Array<symbol | number | string | undefined | null>;
  }>;
}>;

//restFullAPIs validate
export const restFullApiValidate = (schema: SchemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const issues: IssuesType = [];
    for (const key of Object.keys(schema) as Array<keyOfReq>) {
      if (!key) continue;
      const validationResult = schema[key]?.safeParse(req[key]);
      if (validationResult && validationResult.success) {
        (req as any)[key] = validationResult.data;
      }
      if (validationResult && !validationResult.success) {
        const error = validationResult.error;
        issues.push({
          key,
          issues: error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        });
      }
    }
    if (issues.length) {
      throw new BadRequestError("Validation Error", { issues });
    }

    next();
  };
};

//gql validate
export const GQLValidate = async <T>({
  schema,
  args,
}: {
  schema: ZodType;
  args: T;
}): Promise<T> => {
  const validationResult = schema.safeParse(args);
  if (!validationResult.success) {
    throw GQLError(
      new ValidationError("Validation Error", {
        issues: validationResult.error.issues.map((issue) => {
          return { path: issue.path, message: issue.message };
        }),
      }),
    );
  }

  return validationResult.data as T;
};

//socket validate
export const socketValidate = async <T>({
  schema,
  args,
}: {
  schema: ZodType;
  args: T;
}) => {
  const validationResult = schema.safeParse(args);
  if (!validationResult.success) {
    new ValidationError("Validation Error", {
      issues: validationResult.error.issues.map((issue) => {
        return { path: issue.path, message: issue.message };
      }),
    });
  }

  return true;
};
