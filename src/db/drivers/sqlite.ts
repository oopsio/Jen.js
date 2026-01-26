import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { QueryResult } from '../types';

export class SQLiteDriver {
  db?: sqlite3.Database;

  async connect(path: string) {
    this.db = await open({ filename: path, driver: sqlite3.Database });
  }

  async query<T=any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.db) throw new Error('SQLite not connected');
    return this.db.all<T>(sql, params);
  }
}
