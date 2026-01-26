// SQLite driver - external SQLite library not included
// Users should implement with their own sqlite library (e.g., npm install sqlite3 sqlite)
import { QueryResult } from '../types';

export class SQLiteDriver {
  async connect(path: string) {
    throw new Error('SQLite implementation requires external library. Install: npm install sqlite3 sqlite');
  }

  async query<T=any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    throw new Error('SQLite implementation requires external library. Install: npm install sqlite3 sqlite');
  }
}
