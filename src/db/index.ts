import { DBConfig, IDBDriver, UnifiedQuery } from "./types.js";
import { DBConnector } from "./connector.js";

export * from "./types.js";
export * from "./connector.js";

export class DB {
  private driver: IDBDriver;

  constructor(config: DBConfig) {
    this.driver = DBConnector.create(config);
  }

  async connect() { await this.driver.connect(); }
  async disconnect() { await this.driver.disconnect(); }

  async query<T = any>(q: UnifiedQuery<T>) { return this.driver.query<T>(q); }
  async find<T = any>(coll: string, where?: any) { return this.driver.query<T>({ find: coll, where }); }
  async create<T = any>(coll: string, data: any) { return this.driver.create<T>(coll, data); }
  async update(coll: string, filter: any, update: any) { return this.driver.update(coll, filter, update); }
  async delete(coll: string, filter: any) { return this.driver.delete(coll, filter); }
  async count(coll: string, filter: any) { return this.driver.count(coll, filter); }
}