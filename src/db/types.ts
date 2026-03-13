export type DBType = "jdb" | "sqlite" | "mysql" | "postgres" | "mongodb" | "redis";

export interface DBConfig {
  type: DBType;
  connection?: any; 
  jdb?: {
    root: string;
    inMemory?: boolean;
  };
}

export type FindQuery<T = any> = {
  find: string;
  where?: Record<string, any>;
  options?: { limit?: number; skip?: number; sort?: any };
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
  create<T = any>(collection: string, data: any): Promise<T>;
  update<T = any>(collection: string, filter: any, update: any): Promise<number>;
  delete<T = any>(collection: string, filter: any): Promise<number>;
  count<T = any>(collection: string, filter: any): Promise<number>;
}