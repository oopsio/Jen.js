import { Filter, Update, QueryOptions } from "../jdb/types";

export type DBType = "jdb" | "sqlite" | "mysql" | "postgres";

export interface DBConfig {
  type: DBType;
  connection?: any; // Connection string or object
  jdb?: {
    root: string;
    inMemory?: boolean;
  };
}

// Unified Query Interface
export type FindQuery<T = any> = {
  find: string; // collection/table name
  where?: Filter<T>; // NoSQL style filter
  options?: QueryOptions;
};

export type SQLQuery = {
  sql: string;
  params?: any[];
};

export type UnifiedQuery<T = any> = FindQuery<T> | SQLQuery | string;

export interface IDBDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(q: UnifiedQuery<T>): Promise<T[]>;
  // CRUD shortcuts
  create<T = any>(collection: string, data: any): Promise<T>;
  update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number>;
  delete<T = any>(collection: string, filter: Filter<T>): Promise<number>;
  count<T = any>(collection: string, filter: Filter<T>): Promise<number>;
}
