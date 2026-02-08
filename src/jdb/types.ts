export type JDBConfig = {
  root: string; // Directory to store .jdb files
  inMemory?: boolean; // If true, don't write to disk (for testing)
};

export type Document = Record<string, any> & {
  _id: string;
  _created: number;
  _updated: number;
};

export type FilterOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin"
  | "$regex";

export type Filter<T = any> = {
  [K in keyof T]?: T[K] | { [op in FilterOperator]?: any };
} & {
  $or?: Filter<T>[];
  $and?: Filter<T>[];
};

export type UpdateOperator = "$set" | "$unset" | "$inc" | "$push" | "$pull";

export type Update<T = any> = {
  [op in UpdateOperator]?: Partial<T> | Record<string, any>;
};

export type QueryOptions = {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
};

export interface IDatabaseEngine {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  collection(name: string): ICollection;
}

export interface ICollection<T extends Document = Document> {
  name: string;
  insert(
    doc: Omit<T, "_id" | "_created" | "_updated"> & { _id?: string },
  ): Promise<T>;
  insertMany(
    docs: (Omit<T, "_id" | "_created" | "_updated"> & { _id?: string })[],
  ): Promise<T[]>;
  findOne(filter: Filter<T>): Promise<T | null>;
  find(filter: Filter<T>, options?: QueryOptions): Promise<T[]>;
  update(
    filter: Filter<T>,
    update: Update<T>,
    multi?: boolean,
  ): Promise<number>;
  delete(filter: Filter<T>, multi?: boolean): Promise<number>;
  count(filter: Filter<T>): Promise<number>;
}
