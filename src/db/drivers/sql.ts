import { IDBDriver, DBConfig, UnifiedQuery, SQLQuery, FindQuery } from '../types';
import { Filter, Update } from '../../jdb/types';

type QueryExecutor = (sql: string, params: any[]) => Promise<any[]>;

export class SQLDriver implements IDBDriver {
  private executor: QueryExecutor;

  constructor(config: DBConfig) {
    if (typeof config.connection === 'function') {
      this.executor = config.connection;
    } else if (config.connection && config.connection.query) {
       // Support objects like Pool or Client from pg/mysql
       this.executor = (sql, params) => config.connection.query(sql, params);
    } else {
      // Default stub that warns if no connection provided, or we could try to load a default
      this.executor = async () => { throw new Error('No SQL connection provided to SQLDriver'); };
    }
  }

  async connect() {
    // Connection management usually handled by the pool passed in, but we can add logic here if needed
  }

  async disconnect() {
    // No-op or close pool
  }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    if (typeof q === 'string') {
      return this.executor(q, []);
    }
    if ('sql' in q) {
      return this.executor(q.sql, q.params || []);
    }
    
    // Convert NoSQL style to SQL (Basic translation)
    const query = q as FindQuery<T>;
    const { sql, params } = this.translateQuery(query);
    return this.executor(sql, params);
  }

  private translateQuery(q: FindQuery): { sql: string, params: any[] } {
    let sql = `SELECT * FROM ${q.find}`;
    const params: any[] = [];
    
    if (q.where && Object.keys(q.where).length > 0) {
      const conditions: string[] = [];
      for (const key in q.where) {
        const val = (q.where as any)[key];
        // Very basic generic SQL translation
        conditions.push(`${key} = ?`);
        params.push(val);
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (q.options?.limit) {
      sql += ` LIMIT ${q.options.limit}`;
    }
    if (q.options?.skip) {
      sql += ` OFFSET ${q.options.skip}`; // Standard SQL
    }
    
    return { sql, params };
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const sql = `INSERT INTO ${collection} (${keys.join(',')}) VALUES (${placeholders})`;
    const params = keys.map(k => data[k]);
    await this.executor(sql, params);
    // Retrieve generic - this might need adjustment per driver for "returning" support
    return data as T; 
  }

  async update<T = any>(collection: string, filter: Filter<T>, update: Update<T>): Promise<number> {
    // Basic implementation requiring WHERE clause
    // This is complex to map generic Mongo-style updates to SQL without a robust builder
    throw new Error('Complex update translation not implemented for Generic SQL Driver yet. Use raw SQL.');
  }

  async delete<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    const { sql, params } = this.translateQuery({ find: collection, where: filter });
    const deleteSql = sql.replace('SELECT *', 'DELETE');
    await this.executor(deleteSql, params);
    return 1; // Unknown count without driver specific result
  }

  async count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    const { sql, params } = this.translateQuery({ find: collection, where: filter });
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const res = await this.executor(countSql, params);
    return res[0]?.count || 0;
  }
}
