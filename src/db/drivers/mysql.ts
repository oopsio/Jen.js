import mysql from 'mysql2/promise';
import { QueryResult } from '../types';

export class MySQLDriver {
  pool?: mysql.Pool;

  connect(connectionString: string) {
    this.pool = mysql.createPool(connectionString);
  }

  async query<T=any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('MySQL not connected');
    const [rows] = await this.pool.query<T & mysql.RowDataPacket[]>(sql, params);
    return rows;
  }
}
