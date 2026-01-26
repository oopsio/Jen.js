// MySQL driver - external MySQL library not included
// Users should implement with their own mysql2 library (e.g., npm install mysql2)
import { QueryResult } from '../types';

export class MySQLDriver {
  connect(connectionString: string) {
    throw new Error('MySQL implementation requires external library. Install: npm install mysql2');
  }

  async query<T=any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    throw new Error('MySQL implementation requires external library. Install: npm install mysql2');
  }
}
