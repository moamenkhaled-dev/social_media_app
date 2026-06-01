import { Types } from "mongoose";

export const toObjectId = (data: string): Types.ObjectId => {
  return Types.ObjectId.createFromHexString(data);
};
