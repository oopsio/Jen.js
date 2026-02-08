import {
  IDBDriver,
  DBConfig,
  UnifiedQuery,
  SQLQuery,
  FindQuery,
} from "../types";
import { Filter, Update } from "../../jdb/types";

type QueryExecutor = (sql: string, params: any[]) => Promise<any[]>;

// Whitelist of allowed identifiers (table/column names) - must be explicitly allowed
const ALLOWED_IDENTIFIERS = new Set<string>();

/**
 * Safely quote SQL identifier to prevent injection
 * Only accepts alphanumeric, underscore, hyphen
 */
function quoteIdentifier(id: string): string {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(
      `Invalid SQL identifier: ${id}. Only alphanumeric, underscore, and hyphen allowed.`,
    );
  }
  return `\`${id}\``; // Use backticks for MySQL, adjust for other databases
}

/**
 * Validate and register allowed table/collection names for security
 */
export function registerAllowedTable(tableName: string): void {
  if (/^[a-zA-Z0-9_-]+$/.test(tableName)) {
    ALLOWED_IDENTIFIERS.add(tableName);
  } else {
    throw new Error(`Invalid table name: ${tableName}`);
  }
}

/**
 * Check if table is in allowed list
 */
function isTableAllowed(tableName: string): boolean {
  return ALLOWED_IDENTIFIERS.has(tableName);
}

/**
 * Validate integer value (for LIMIT/OFFSET)
 */
function validateInteger(value: any): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) {
    throw new Error(`Invalid integer value: ${value}`);
  }
  return num;
}

export class SQLDriver implements IDBDriver {
  private executor: QueryExecutor;

  constructor(config: DBConfig) {
    if (typeof config.connection === "function") {
      this.executor = config.connection;
    } else if (config.connection && config.connection.query) {
      // Support objects like Pool or Client from pg/mysql
      this.executor = (sql, params) => config.connection.query(sql, params);
    } else {
      // Default stub that warns if no connection provided, or we could try to load a default
      this.executor = async () => {
        throw new Error("No SQL connection provided to SQLDriver");
      };
    }
  }

  async connect() {
    // Connection management usually handled by the pool passed in, but we can add logic here if needed
  }

  async disconnect() {
    // No-op or close pool
  }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    if (typeof q === "string") {
      return this.executor(q, []);
    }
    if ("sql" in q) {
      return this.executor(q.sql, q.params || []);
    }

    // Convert NoSQL style to SQL (Basic translation)
    const query = q as FindQuery<T>;
    const { sql, params } = this.translateQuery(query);
    return this.executor(sql, params);
  }

  private translateQuery(q: FindQuery): { sql: string; params: any[] } {
    // Security: Validate table name
    if (!isTableAllowed(q.find)) {
      throw new Error(
        `Table '${q.find}' not registered. Call registerAllowedTable() first.`,
      );
    }

    let sql = `SELECT * FROM ${quoteIdentifier(q.find)}`;
    const params: any[] = [];

    if (q.where && Object.keys(q.where).length > 0) {
      const conditions: string[] = [];
      for (const key in q.where) {
        const val = (q.where as any)[key];
        // Security: Validate column name
        if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
          throw new Error(`Invalid column name: ${key}`);
        }
        conditions.push(`${quoteIdentifier(key)} = ?`);
        params.push(val);
      }
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (q.options?.limit) {
      // Security: Validate limit is a positive integer
      const limit = validateInteger(q.options.limit);
      sql += ` LIMIT ${limit}`;
    }
    if (q.options?.skip) {
      // Security: Validate offset is a non-negative integer
      const skip = validateInteger(q.options.skip);
      sql += ` OFFSET ${skip}`;
    }

    return { sql, params };
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    // Security: Validate table name
    if (!isTableAllowed(collection)) {
      throw new Error(
        `Table '${collection}' not registered. Call registerAllowedTable() first.`,
      );
    }

    const keys = Object.keys(data);

    // Security: Validate all column names
    for (const key of keys) {
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        throw new Error(`Invalid column name: ${key}`);
      }
    }

    const placeholders = keys.map(() => "?").join(",");
    const quotedKeys = keys.map((k) => quoteIdentifier(k)).join(",");
    const sql = `INSERT INTO ${quoteIdentifier(collection)} (${quotedKeys}) VALUES (${placeholders})`;
    const params = keys.map((k) => data[k]);
    await this.executor(sql, params);
    // Retrieve generic - this might need adjustment per driver for "returning" support
    return data as T;
  }

  async update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number> {
    // Basic implementation requiring WHERE clause
    // This is complex to map generic Mongo-style updates to SQL without a robust builder
    throw new Error(
      "Complex update translation not implemented for Generic SQL Driver yet. Use raw SQL.",
    );
  }

  async delete<T = any>(
    collection: string,
    filter: Filter<T>,
  ): Promise<number> {
    // Security: Validate table name
    if (!isTableAllowed(collection)) {
      throw new Error(
        `Table '${collection}' not registered. Call registerAllowedTable() first.`,
      );
    }

    const { sql, params } = this.translateQuery({
      find: collection,
      where: filter,
    });
    const deleteSql = sql.replace("SELECT *", "DELETE");
    await this.executor(deleteSql, params);
    return 1; // Unknown count without driver specific result
  }

  async count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    // Security: Validate table name
    if (!isTableAllowed(collection)) {
      throw new Error(
        `Table '${collection}' not registered. Call registerAllowedTable() first.`,
      );
    }

    const { sql, params } = this.translateQuery({
      find: collection,
      where: filter,
    });
    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as count");
    const res = await this.executor(countSql, params);
    return res[0]?.count || 0;
  }
}
