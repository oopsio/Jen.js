import { IDBDriver, DBConfig, UnifiedQuery, FindQuery } from "../types";
import { JDBEngine, JDBConfig } from "../../jdb";
import { Filter, Update } from "../../jdb/types";

export class JDBDriver implements IDBDriver {
  private engine: JDBEngine;

  constructor(config: DBConfig) {
    const jdbConfig: JDBConfig = config.jdb || {
      root: "./data",
      inMemory: false,
    };
    this.engine = new JDBEngine(jdbConfig);
  }

  async connect() {
    await this.engine.connect();
  }

  async disconnect() {
    await this.engine.disconnect();
  }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    if (typeof q === "string") {
      throw new Error(
        "Raw string queries not supported in JDB directly. Use object syntax.",
      );
    }
    if ("sql" in q) {
      throw new Error("SQL queries not supported in JDB driver.");
    }

    const query = q as FindQuery<T>;
    const coll = this.engine.collection<any>(query.find);
    return await coll.find(query.where || {}, query.options);
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    return await this.engine.collection<any>(collection).insert(data);
  }

  async update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number> {
    return await this.engine
      .collection<any>(collection)
      .update(filter, update, true);
  }

  async delete<T = any>(
    collection: string,
    filter: Filter<T>,
  ): Promise<number> {
    return await this.engine.collection<any>(collection).delete(filter, true);
  }

  async count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    return await this.engine.collection<any>(collection).count(filter);
  }
}
