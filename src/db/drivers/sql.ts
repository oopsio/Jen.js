/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
    throw new Error(`Invalid table name: ${tableName}. Must start with letter, underscore, or dollar. Only alphanumeric, underscore, and dollar allowed.`);
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
       const whereRecord = q.where as Record<string, any>;
       for (const key in whereRecord) {
         // Security: Validate column name
         if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
           throw new Error(`Invalid column name: ${key}. Must start with letter, underscore, or dollar. Only alphanumeric, underscore, and dollar allowed.`);
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
        throw new Error(`Invalid column name: ${key}. Must start with letter, underscore, or dollar. Only alphanumeric, underscore, and dollar allowed.`);
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

    // Validate that filter is not empty to prevent accidental full table delete
    if (!filter || Object.keys(filter).length === 0) {
      throw new Error("Delete requires at least one filter condition. Use truncate or raw SQL for full table deletion.");
    }

    const { sql, params } = this.translateQuery({
      find: collection,
      where: filter,
    });
    const deleteSql = sql.replace("SELECT \\*", "DELETE");
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
