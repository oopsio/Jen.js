/**
 * Configuration for the JDB (Jen Database) engine.
 * Specifies the storage location and memory mode for data persistence.
 *
 * @example
 * const config: JDBConfig = {
 *   root: './data/jdb',
 *   inMemory: false
 * };
 */
export type JDBConfig = {
  /** Absolute or relative path to directory where .jdb collection files are stored. */
  root: string;
  /** If true, data is stored only in memory; files are not written to disk. Useful for testing. */
  inMemory?: boolean;
};

/**
 * Base document type for all collections.
 * Every document in a JDB collection must include system metadata fields.
 * These fields are automatically managed and should not be manually modified.
 *
 * @example
 * interface User extends Document {
 *   name: string;
 *   email: string;
 * }
 */
export type Document = Record<string, any> & {
  /** Unique identifier automatically generated as a UUID. */
  _id: string;
  /** Timestamp (milliseconds) when the document was created. Set once, never changes. */
  _created: number;
  /** Timestamp (milliseconds) when the document was last updated. Updated on every modification. */
  _updated: number;
};

/**
 * Filter operators for querying documents.
 * Support MongoDB-like query syntax for flexible filtering.
 */
export type FilterOperator =
  | "$eq" /** Equal to the specified value. */
  | "$ne" /** Not equal to the specified value. */
  | "$gt" /** Greater than the specified value. */
  | "$gte" /** Greater than or equal to the specified value. */
  | "$lt" /** Less than the specified value. */
  | "$lte" /** Less than or equal to the specified value. */
  | "$in" /** Value is in the specified array. */
  | "$nin" /** Value is not in the specified array. */
  | "$regex"; /** Value matches the specified regular expression pattern. */

/**
 * Filter object for querying documents.
 * Supports both simple equality checks and complex operator-based conditions.
 * Supports logical combinations via $and and $or.
 *
 * @example
 * // Simple equality
 * const filter1: Filter<User> = { name: 'John' };
 *
 * // Operator-based conditions
 * const filter2: Filter<User> = { age: { $gte: 18 } };
 *
 * // Logical operators
 * const filter3: Filter<User> = {
 *   $or: [{ name: 'John' }, { name: 'Jane' }]
 * };
 */
export type Filter<T = any> = {
  [K in keyof T]?: T[K] | { [op in FilterOperator]?: any };
} & {
  /** Logical OR: document matches if it matches any filter in the array. */
  $or?: Filter<T>[];
  /** Logical AND: document matches if it matches all filters in the array. */
  $and?: Filter<T>[];
};

/**
 * Update operators for modifying documents.
 * Enable atomic field modifications without replacing the entire document.
 */
export type UpdateOperator =
  | "$set" /** Set field value(s). Overwrites existing values. */
  | "$unset" /** Remove field(s) from the document. */
  | "$inc" /** Increment numeric field(s) by the specified amount. */
  | "$push" /** Append value(s) to an array field. Creates array if it doesn't exist. */
  | "$pull"; /** Remove all occurrences of value(s) from an array field. */

/**
 * Update object for modifying documents.
 * Specifies which fields to change and how, using update operators.
 *
 * @example
 * // Set operation
 * const update1: Update<User> = { $set: { name: 'Jane', age: 30 } };
 *
 * // Multiple operators
 * const update2: Update<User> = {
 *   $set: { status: 'active' },
 *   $inc: { loginCount: 1 }
 * };
 */
export type Update<T = any> = {
  [op in UpdateOperator]?: Partial<T> | Record<string, any>;
};

/**
 * Options for controlling query behavior.
 * Supports sorting, limiting, and skipping results for pagination and ordering.
 *
 * @example
 * const options: QueryOptions = {
 *   sort: { createdAt: -1 },
 *   skip: 10,
 *   limit: 20
 * };
 */
export type QueryOptions = {
  /** Maximum number of documents to return. */
  limit?: number;
  /** Number of documents to skip before returning results. Used for pagination. */
  skip?: number;
  /** Sort specification. Value 1 for ascending, -1 for descending. Multiple fields supported. */
  sort?: Record<string, 1 | -1>;
};

/**
 * Abstract interface for a database engine.
 * Defines the contract that database implementations must follow.
 * Handles connection lifecycle and provides access to collections.
 */
export interface IDatabaseEngine {
  /** Establish connection to the database and perform initialization. */
  connect(): Promise<void>;
  /** Close connection and clean up resources. */
  disconnect(): Promise<void>;
  /** Get or create a collection by name. Creates a new instance if collection doesn't exist. */
  collection(name: string): ICollection;
}

/**
 * Collection interface for CRUD operations on documents.
 * Provides MongoDB-like methods for inserting, querying, updating, and deleting documents.
 * All operations are async to support file I/O and potential distributed backends.
 *
 * @template T Document type, must extend Document base type with _id, _created, _updated.
 *
 * @example
 * interface BlogPost extends Document {
 *   title: string;
 *   content: string;
 *   published: boolean;
 * }
 *
 * const posts: ICollection<BlogPost> = db.collection('posts');
 * const post = await posts.insert({ title: 'Hello', content: '...' });
 * const found = await posts.findOne({ _id: post._id });
 */
export interface ICollection<T extends Document = Document> {
  /** Name of the collection. */
  name: string;

  /**
   * Insert a single document into the collection.
   * Automatically generates _id, _created, and _updated if not provided.
   *
   * @param doc The document to insert. _id, _created, _updated are optional.
   * @returns The inserted document with all system fields populated.
   */
  insert(
    doc: Omit<T, "_id" | "_created" | "_updated"> & { _id?: string },
  ): Promise<T>;

  /**
   * Insert multiple documents into the collection atomically.
   * All documents are assigned the same _created timestamp.
   *
   * @param docs Array of documents to insert.
   * @returns Array of inserted documents with all system fields populated.
   */
  insertMany(
    docs: (Omit<T, "_id" | "_created" | "_updated"> & { _id?: string })[],
  ): Promise<T[]>;

  /**
   * Find the first document matching the filter.
   * Returns null if no match found.
   *
   * @param filter Query filter to match documents.
   * @returns The first matching document, or null if none found.
   */
  findOne(filter: Filter<T>): Promise<T | null>;

  /**
   * Find all documents matching the filter with optional sorting and pagination.
   *
   * @param filter Query filter to match documents.
   * @param options Optional sorting, limiting, and pagination options.
   * @returns Array of matching documents (empty array if no matches).
   */
  find(filter: Filter<T>, options?: QueryOptions): Promise<T[]>;

  /**
   * Update document(s) matching the filter.
   * Updates _updated timestamp automatically.
   *
   * @param filter Query filter to select documents to update.
   * @param update Update operators and values to apply.
   * @param multi If false (default), updates only first match. If true, updates all matches.
   * @returns Count of documents updated.
   */
  update(
    filter: Filter<T>,
    update: Update<T>,
    multi?: boolean,
  ): Promise<number>;

  /**
   * Delete document(s) matching the filter.
   *
   * @param filter Query filter to select documents to delete.
   * @param multi If false (default), deletes only first match. If true, deletes all matches.
   * @returns Count of documents deleted.
   */
  delete(filter: Filter<T>, multi?: boolean): Promise<number>;

  /**
   * Count documents matching the filter.
   *
   * @param filter Query filter to match documents.
   * @returns Number of documents matching the filter.
   */
  count(filter: Filter<T>): Promise<number>;
}
