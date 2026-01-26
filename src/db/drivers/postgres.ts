// PostgreSQL driver - external PostgreSQL library not included
// Users should implement with their own pg library (e.g., npm install pg)
import { QueryResult } from '../types';

export class PostgresDriver {
  connect(connectionString: string) {
    throw new Error('PostgreSQL implementation requires external library. Install: npm install pg');
  }

  async query<T=any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    throw new Error('PostgreSQL implementation requires external library. Install: npm install pg');
  }
}
