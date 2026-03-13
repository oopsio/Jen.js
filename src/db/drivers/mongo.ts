import { MongoClient, Db } from "mongodb";
import { IDBDriver, DBConfig, UnifiedQuery, FindQuery } from "../types.js";

export class MongoDriver implements IDBDriver {
  private client: MongoClient;
  private db!: Db;

  constructor(config: DBConfig) {
    this.client = new MongoClient(config.connection);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db();
  }

  async disconnect() { await this.client.close(); }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    const fq = q as FindQuery;
    return this.db.collection(fq.find).find(fq.where || {}).toArray() as any;
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    const res = await this.db.collection(collection).insertOne(data);
    return { ...data, _id: res.insertedId };
  }

  async update(collection: string, filter: any, update: any): Promise<number> {
    const res = await this.db.collection(collection).updateMany(filter, { $set: update });
    return res.modifiedCount;
  }

  async delete(collection: string, filter: any): Promise<number> {
    const res = await this.db.collection(collection).deleteMany(filter);
    return res.deletedCount;
  }

  async count(collection: string, filter: any): Promise<number> {
    return this.db.collection(collection).countDocuments(filter);
  }
}