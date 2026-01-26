import { MongoClient, Db } from 'mongodb';
import { QueryResult } from '../types';

export class MongoDriver {
  client?: MongoClient;
  db?: Db;

  async connect(connectionString: string, dbName?: string) {
    this.client = new MongoClient(connectionString);
    await this.client.connect();
    this.db = this.client.db(dbName);
  }

  async query<T=any>(collection: string, filter: object = {}): Promise<QueryResult<T>> {
    if (!this.db) throw new Error('MongoDB not connected');
    return this.db.collection<T>(collection).find(filter).toArray();
  }
}
