import type {
  AggregateOptions,
  CreateOptions,
  DeleteResult,
  FlattenMaps,
  HydratedDocument,
  InsertManyOptions,
  Model,
  MongooseBaseQueryOptions,
  MongooseUpdateQueryOptions,
  PipelineStage,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
  UpdateResult,
  UpdateWithAggregationPipeline,
} from "mongoose";
import { PaginateDefault } from "../../common/constants/paginate.constants.js";

export type PaginateMetaType = {
  totalPages: number;
  totalDocs: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
export type PaginateType<T> = {
  data: Array<T>;
  meta: PaginateMetaType;
};

export abstract class DataBaseRepository<TRawDocType, TMethods = {}> {
  constructor(private model: Model<TRawDocType, any, TMethods>) {}

  // create
  async create({
    data,
    options,
  }: {
    data: Array<Partial<TRawDocType>>;
    options?: CreateOptions | undefined;
  }): Promise<Array<HydratedDocument<TRawDocType, TMethods>>> {
    return (await this.model.create(data as any, options)) as any;
  }
  // createOne
  async createOne({
    data,
    options,
  }: {
    data: Partial<TRawDocType>;
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDocType, TMethods> | undefined> {
    const [doc] = await this.create({ data: [data], options });
    return doc;
  }

  // find
  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<Array<FlattenMaps<TRawDocType>>>;
  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<Array<HydratedDocument<TRawDocType, TMethods>>>;
  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType>;
  }): Promise<
    | Array<HydratedDocument<TRawDocType, TMethods>>
    | Array<FlattenMaps<TRawDocType>>
  > {
    return await this.model.find(filter, projection, options);
  }

  //findOne
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<FlattenMaps<TRawDocType> | null>;
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<HydratedDocument<TRawDocType, TMethods> | null>;
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType>;
  }): Promise<
    HydratedDocument<TRawDocType, TMethods> | FlattenMaps<TRawDocType> | null
  > {
    return await this.model.findOne(filter, projection, options);
  }

  //findOneAndUpdate
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType>;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<FlattenMaps<TRawDocType> | null>;
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType>;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<HydratedDocument<TRawDocType, TMethods> | null>;
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType>;
    options?: QueryOptions<TRawDocType>;
  }): Promise<
    HydratedDocument<TRawDocType, TMethods> | FlattenMaps<TRawDocType> | null
  > {
    if (Array.isArray(update)) {
      return await this.model.findOneAndUpdate(
        filter,
        [...update, { $set: { __v: { $add: ["$__v", 1] } } }],
        {
          ...options,
          returnDocument: "after",
          runValidators: true,
          updatePipeline: true,
        },
      );
    }

    return await this.model.findOneAndUpdate(
      filter,
      {
        ...update,
        $inc: {
          ...(update.$inc ?? {}),
          __v: 1,
        },
      },
      {
        ...options,
        returnDocument: "after",
        runValidators: true,
      },
    );
  }

  //findOneAndDelete
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<FlattenMaps<TRawDocType>>;
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<HydratedDocument<TRawDocType, TMethods>>;
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    options?: QueryOptions<TRawDocType>;
  }): Promise<
    HydratedDocument<TRawDocType, TMethods> | FlattenMaps<TRawDocType> | null
  > {
    return await this.model.findOneAndDelete(filter, options);
  }

  //findById
  async findById({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId | string;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<FlattenMaps<TRawDocType> | null>;
  async findById({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId | string;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<HydratedDocument<TRawDocType, TMethods> | null>;
  async findById({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId | string;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType>;
  }): Promise<
    HydratedDocument<TRawDocType, TMethods> | FlattenMaps<TRawDocType> | null
  > {
    return await this.model.findById(id, projection, options);
  }

  //findByIdAndUpdate
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId | string;
    update: UpdateQuery<TRawDocType>;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<FlattenMaps<TRawDocType> | null>;
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId | string;
    update: UpdateQuery<TRawDocType>;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<HydratedDocument<TRawDocType, TMethods> | null>;
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId | string;
    update: UpdateQuery<TRawDocType>;
    options?: QueryOptions<TRawDocType>;
  }): Promise<
    HydratedDocument<TRawDocType, TMethods> | FlattenMaps<TRawDocType> | null
  > {
    return await this.model.findByIdAndUpdate(id, update, {
      ...options,
      returnDocument: "after",
    });
  }

  //findByIdAndDelete
  async findByIdAndDelete({
    id,
    options,
  }: {
    id: Types.ObjectId | string;
    options: QueryOptions<TRawDocType> & { lean: true };
  }): Promise<FlattenMaps<TRawDocType> | null>;
  async findByIdAndDelete({
    id,
    options,
  }: {
    id: Types.ObjectId | string;
    options?: QueryOptions<TRawDocType> & { lean?: false };
  }): Promise<HydratedDocument<TRawDocType, TMethods> | null>;
  async findByIdAndDelete({
    id,
    options,
  }: {
    id: Types.ObjectId | string;
    options?: QueryOptions<TRawDocType> | null;
  }): Promise<
    HydratedDocument<TRawDocType, TMethods> | FlattenMaps<TRawDocType> | null
  > {
    return await this.model.findByIdAndDelete(id, options);
  }

  //countDocuments
  async countDocuments({
    filter,
    options,
  }: {
    filter?: QueryFilter<TRawDocType>;
    options?: MongooseBaseQueryOptions<TRawDocType>;
  }): Promise<number> {
    return await this.model.countDocuments(filter, options);
  }

  //paginate
  async paginate({
    filter,
    projection,
    options,
    page,
    limit,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options: QueryOptions<TRawDocType> & { lean: true };
    page?: number;
    limit?: number;
  }): Promise<{
    data: Array<FlattenMaps<TRawDocType>>;
    meta: PaginateMetaType;
  }>;
  async paginate({
    filter,
    projection,
    options,
    page,
    limit,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType> & { lean?: false };
    page?: number;
    limit?: number;
  }): Promise<{
    data: Array<HydratedDocument<TRawDocType, TMethods>>;
    meta: PaginateMetaType;
  }>;
  async paginate({
    filter,
    projection,
    options,
    page = PaginateDefault.PAGE,
    limit = PaginateDefault.LIMIT,
  }: {
    filter: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType>;
    page?: number;
    limit?: number;
  }): Promise<
    | {
        data: Array<FlattenMaps<TRawDocType>>;
        meta: PaginateMetaType;
      }
    | {
        data: Array<HydratedDocument<TRawDocType, TMethods>>;
        meta: PaginateMetaType;
      }
  > {
    page = Math.max(1, Math.floor(page));
    limit = Math.min(100, Math.max(1, Math.floor(limit)));
    const skip = (page - 1) * limit;
    const [data, totalDocs] = await Promise.all([
      this.find({
        filter,
        projection,
        options: { ...options, skip, limit } as any,
      }),
      this.countDocuments({ filter }),
    ]);
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      data,
      meta: {
        totalPages,
        totalDocs,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  //aggregate
  async aggregate<R = TRawDocType>({
    pipeline = [],
    options,
  }: {
    pipeline?: Array<PipelineStage>;
    options?: AggregateOptions;
  }): Promise<Array<R>> {
    return this.model.aggregate(pipeline, options);
  }

  //updateOne
  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions<TRawDocType> | null;
  }): Promise<UpdateResult> {
    if (Array.isArray(update)) {
      return await this.model.updateOne(
        filter,
        [...update, { $set: { __v: { $add: ["$__v", 1] } } }],
        {
          ...options,
          runValidators: true,
          updatePipeline: true,
        },
      );
    }

    return await this.model.updateOne(filter, update, {
      ...options,
      runValidators: true,
    });
  }

  //updateMany
  async updateMany({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions<TRawDocType> | null;
  }): Promise<UpdateResult> {
    return await this.model.updateMany(filter, update, options);
  }

  //deleteOne
  async deleteOne({
    filter,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    options?: MongooseBaseQueryOptions<TRawDocType> | null;
  }): Promise<DeleteResult> {
    return await this.model.deleteOne(filter, options);
  }

  //deleteMany
  async deleteMany({
    filter,
    options,
  }: {
    filter: QueryFilter<TRawDocType>;
    options?: MongooseBaseQueryOptions<TRawDocType> | null;
  }): Promise<DeleteResult> {
    return await this.model.deleteMany(filter, options);
  }

  async insertMany({
    docs,
    options,
  }: {
    docs: Array<TRawDocType>;
    options?: InsertManyOptions & { rawResult?: false };
  }): Promise<Array<HydratedDocument<TRawDocType, TMethods>>> {
    return (await this.model.insertMany(docs as any, options as any)) as any;
  }
}
