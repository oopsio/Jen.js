import { DBConfig, IDBDriver, UnifiedQuery, FindQuery } from "./types";
import { DBConnector } from "./connector";
import { Filter, Update } from "../jdb/types";

export * from "./types";
export * from "./drivers/jdb";
export * from "./drivers/sql";

export class DB {
  private driver: IDBDriver;
  private config: DBConfig;

  constructor(config: DBConfig) {
    this.config = config;
    this.driver = DBConnector.create(config);
  }

  async connect() {
    await this.driver.connect();
  }

  async disconnect() {
    await this.driver.disconnect();
  }

  async query<T = any>(
    q: UnifiedQuery<T> | string,
    params?: any[],
  ): Promise<T[]> {
    if (typeof q === "string") {
      return this.driver.query({ sql: q, params });
    }
    return this.driver.query(q);
  }

  // Fluent API Shortcuts

  find<T = any>(
    collection: string,
    filter?: Filter<T>,
    options?: any,
  ): Promise<T[]> {
    return this.driver.query({ find: collection, where: filter, options });
  }

  async findOne<T = any>(
    collection: string,
    filter: Filter<T>,
  ): Promise<T | null> {
    const res = await this.driver.query({
      find: collection,
      where: filter,
      options: { limit: 1 },
    });
    return res[0] || null;
  }

  create<T = any>(collection: string, data: any): Promise<T> {
    return this.driver.create(collection, data);
  }

  update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number> {
    return this.driver.update(collection, filter, update);
  }

  delete<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    return this.driver.delete(collection, filter);
  }

  count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    return this.driver.count(collection, filter);
  }
}
