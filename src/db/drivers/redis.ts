import { createClient, RedisClientType } from "redis";
import { IDBDriver, DBConfig, UnifiedQuery, FindQuery } from "../types.js";

export class RedisDriver implements IDBDriver {
  private client: RedisClientType;

  constructor(config: DBConfig) {
    this.client = createClient({ url: config.connection });
  }

  async connect() { await this.client.connect(); }
  async disconnect() { await this.client.quit(); }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    const fq = q as FindQuery;
    const keys = await this.client.keys(`${fq.find}:*`);
    const results: T[] = [];

    for (const key of keys) {
      const val = await this.client.get(key);
      if (val) {
        const parsed = JSON.parse(val) as T & Record<string, any>;
        if (!fq.where || Object.entries(fq.where).every(([k, v]) => parsed[k] === v)) {
          results.push(parsed);
        }
      }
    }
    return results;
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    const id = data.id || Math.random().toString(36).substring(7);
    const record = { ...data, id };
    await this.client.set(`${collection}:${id}`, JSON.stringify(record));
    return record;
  }

  async update(collection: string, filter: any, update: any): Promise<number> {
    const items = await this.query(collection as any); // Simple scan
    let count = 0;
    for (const item of items) {
      const obj = item as Record<string, any>;
      if (Object.entries(filter).every(([k, v]) => obj[k] === v)) {
        const updated = { ...obj, ...update };
        await this.client.set(`${collection}:${obj.id}`, JSON.stringify(updated));
        count++;
      }
    }
    return count;
  }

  async delete(collection: string, filter: any): Promise<number> {
    const items = await this.query(collection as any);
    let count = 0;
    for (const item of items) {
      const obj = item as Record<string, any>;
      if (Object.entries(filter).every(([k, v]) => obj[k] === v)) {
        await this.client.del(`${collection}:${obj.id}`);
        count++;
      }
    }
    return count;
  }

  async count(collection: string, filter: any): Promise<number> {
    const res = await this.query({ find: collection, where: filter });
    return res.length;
  }
}