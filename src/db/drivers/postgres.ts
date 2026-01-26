import { Pool } from 'pg';
import { QueryResult } from '../types';

export class PostgresDriver {
  pool?: Pool;

  connect(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async query<T=any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('Postgres not connected');
    const res = await this.pool.query<T>(sql, params);
    return res.rows;
  }
}
