// MongoDB driver - external MongoDB library not included
// Users should implement with their own mongodb library (e.g., npm install mongodb)
import { QueryResult } from '../types';

export class MongoDriver {
  async connect(connectionString: string, dbName?: string) {
    throw new Error('MongoDB implementation requires external library. Install: npm install mongodb');
  }

  async query<T=any>(collection: string, filter: object = {}): Promise<QueryResult<T>> {
    throw new Error('MongoDB implementation requires external library. Install: npm install mongodb');
  }
}
