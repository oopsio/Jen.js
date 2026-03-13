import {
  IDBDriver,
  DBConfig,
  UnifiedQuery,
  SQLQuery,
  FindQuery,
} from "../types.js";
import { Filter, Update } from "../../jdb/types.js";
import { log } from "../../shared/log.js";

type QueryExecutor = (sql: string, params: any[]) => Promise<any[]>;

// Whitelist of allowed identifiers (table/column names) - must be explicitly allowed
const ALLOWED_IDENTIFIERS = new Set<string>();

/**
 * Safely quote SQL identifier to prevent injection
 * Only accepts alphanumeric, underscore, dollar sign
 * Note: Hyphen is NOT allowed as it can cause confusion with operators
 */
function quoteIdentifier(id: string): string {
  if (!id || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id)) {
    throw new Error(
      `Invalid SQL identifier: ${id}. Only alphanumeric, underscore, and dollar sign allowed. Must start with letter, underscore, or dollar.`,
    );
  }
  return `\`${id}\``; // Use backticks for MySQL, adjust for other databases
}

/**
 * Validate and register allowed table/collection names for security
 */
export function registerAllowedTable(tableName: string): void {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(tableName)) {
    ALLOWED_IDENTIFIERS.add(tableName);
  } else {
    throw new Error(
      `Invalid table name: ${tableName}. Must start with letter, underscore, or dollar. Only alphanumeric, underscore, and dollar allowed.`,
    );
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
    try {
      if (typeof q === "string") {
        log.info(`Executing raw SQL: ${q.substring(0, 50)}...`);
        return this.executor(q, []);
      }
      if ("sql" in q) {
        log.info(`Executing SQL query: ${q.sql.substring(0, 50)}...`);
        return this.executor(q.sql, q.params || []);
      }

      // Convert NoSQL style to SQL (Basic translation)
      const query = q as FindQuery<T>;
      const { sql, params } = this.translateQuery(query);
      log.info(`Executing translated query: ${sql.substring(0, 50)}...`);
      return this.executor(sql, params);
    } catch (error) {
      log.error(`Query execution failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
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
      const whereRecord = q.where as Record<string, any>;
      for (const key in whereRecord) {
        // Security: Validate column name
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
          throw new Error(
            `Invalid column name: ${key}. Must start with letter, underscore, or dollar. Only alphanumeric, underscore, and dollar allowed.`,
          );
        }
        // Safely access where property
        const val = whereRecord[key];
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
    try {
      // Security: Validate table name
      if (!isTableAllowed(collection)) {
        throw new Error(
          `Table '${collection}' not registered. Call registerAllowedTable() first.`,
        );
      }

      const keys = Object.keys(data);

      // Security: Validate all column names
      for (const key of keys) {
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
          throw new Error(
            `Invalid column name: ${key}. Must start with letter, underscore, or dollar. Only alphanumeric, underscore, and dollar allowed.`,
          );
        }
      }

      const placeholders = keys.map(() => "?").join(",");
      const quotedKeys = keys.map((k) => quoteIdentifier(k)).join(",");
      const sql = `INSERT INTO ${quoteIdentifier(collection)} (${quotedKeys}) VALUES (${placeholders})`;
      const params = keys.map((k) => data[k]);
      
      log.info(`Creating record in ${collection} with ${keys.length} fields`);
      await this.executor(sql, params);
      
      // Retrieve generic - this might need adjustment per driver for "returning" support
      return data as T;
    } catch (error) {
      log.error(`Create failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number> {
    try {
      // Security: Validate table name
      if (!isTableAllowed(collection)) {
        throw new Error(
          `Table '${collection}' not registered. Call registerAllowedTable() first.`,
        );
      }

      // Validate that filter is not empty to prevent accidental full table update
      if (!filter || Object.keys(filter).length === 0) {
        throw new Error(
          "Update requires at least one filter condition. Prevent full table updates.",
        );
      }

      const updateKeys = Object.keys(update);
      const filterKeys = Object.keys(filter);
      
      // Security: Validate all column names
      for (const key of [...updateKeys, ...filterKeys]) {
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
          throw new Error(
            `Invalid column name: ${key}. Must start with letter, underscore, or dollar.`,
          );
        }
      }

      // Build SET clause
      const setClause = updateKeys
        .map((k) => `${quoteIdentifier(k)} = ?`)
        .join(", ");
      
      // Build WHERE clause
      const whereClause = filterKeys
        .map((k) => `${quoteIdentifier(k)} = ?`)
        .join(" AND ");

      const sql = `UPDATE ${quoteIdentifier(collection)} SET ${setClause} WHERE ${whereClause}`;
      
      // Combine update params and filter params
      const params = [
        ...updateKeys.map((k) => (update as any)[k]),
        ...filterKeys.map((k) => (filter as any)[k]),
      ];

      log.info(`Updating records in ${collection} with ${updateKeys.length} fields`);
      await this.executor(sql, params);
      return 1; // Unknown affected row count without driver specific result
    } catch (error) {
      log.error(`Update failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async delete<T = any>(
    collection: string,
    filter: Filter<T>,
  ): Promise<number> {
    try {
      // Security: Validate table name
      if (!isTableAllowed(collection)) {
        throw new Error(
          `Table '${collection}' not registered. Call registerAllowedTable() first.`,
        );
      }

      // Validate that filter is not empty to prevent accidental full table delete
      if (!filter || Object.keys(filter).length === 0) {
        throw new Error(
          "Delete requires at least one filter condition. Use truncate or raw SQL for full table deletion.",
        );
      }

      const { sql, params } = this.translateQuery({
        find: collection,
        where: filter,
      });
      const deleteSql = sql.replace("SELECT \\*", "DELETE");
      
      log.info(`Deleting from ${collection} with filter`);
      await this.executor(deleteSql, params);
      return 1; // Unknown count without driver specific result
    } catch (error) {
      log.error(`Delete failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    try {
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
      
      log.info(`Counting records in ${collection}`);
      const res = await this.executor(countSql, params);
      return res[0]?.count || 0;
    } catch (error) {
      log.error(`Count failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
