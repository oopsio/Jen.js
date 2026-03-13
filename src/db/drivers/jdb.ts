import { IDBDriver, DBConfig, UnifiedQuery, FindQuery } from "../types.js";
import { JDBEngine, JDBConfig } from "../../jdb/index.js";
import { Filter, Update } from "../../jdb/types.js";
import { log } from "../../shared/log.js";

/**
 * JDB (JSON Database) driver for embedded document storage.
 * Provides a NoSQL interface for file-based or in-memory JSON storage.
 * Ideal for single-process or small-scale deployments.
 *
 * @example
 * ```typescript
 * const driver = new JDBDriver({
 *   jdb: { root: "./data", inMemory: false }
 * });
 * await driver.connect();
 * await driver.create("users", { name: "John", email: "john@example.com" });
 * const users = await driver.query({ find: "users", where: { name: "John" } });
 * ```
 */
export class JDBDriver implements IDBDriver {
  private engine: JDBEngine;

  /**
   * Create a new JDB driver instance.
   * @param config Database configuration with JDB options.
   */
  constructor(config: DBConfig) {
    try {
      const jdbConfig: JDBConfig = config.jdb || {
        root: "./data",
        inMemory: false,
      };

      log.info(
        `Initializing JDB driver: ${jdbConfig.inMemory ? "in-memory" : `file-based (${jdbConfig.root})`}`,
      );
      this.engine = new JDBEngine(jdbConfig);
    } catch (error) {
      log.error(
        `JDB driver initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Connect to JDB engine.
   * Initializes file system or memory storage as configured.
   * @throws Error if connection fails.
   */
  async connect(): Promise<void> {
    try {
      log.info("Connecting to JDB engine...");
      await this.engine.connect();
      log.info("JDB engine connected");
    } catch (error) {
      log.error(
        `JDB connection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Disconnect from JDB engine.
   * Flushes pending writes and closes file handles.
   * @throws Error if disconnection fails.
   */
  async disconnect(): Promise<void> {
    try {
      log.info("Disconnecting from JDB engine...");
      await this.engine.disconnect();
      log.info("JDB engine disconnected");
    } catch (error) {
      log.error(
        `JDB disconnection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Query documents from a collection.
   * Supports NoSQL-style find queries with filters and options.
   * Raw SQL queries are not supported in JDB.
   *
   * @param q Find query with collection name, filter, and options.
   * @returns Array of matching documents.
   * @throws Error if query type is not supported.
   */
  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    try {
      if (typeof q === "string") {
        throw new Error(
          "Raw string queries not supported in JDB directly. Use object syntax.",
        );
      }
      if ("sql" in q) {
        throw new Error("SQL queries not supported in JDB driver.");
      }

      const query = q as FindQuery<T>;
      log.info(`Querying collection: ${query.find}`);
      const coll = this.engine.collection<any>(query.find);
      const results = await coll.find(query.where || {}, query.options);
      log.info(`Found ${results.length} documents in ${query.find}`);
      return results;
    } catch (error) {
      log.error(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Create a new document in a collection.
   * Auto-generates ID if not provided.
   *
   * @param collection Collection name.
   * @param data Document data to insert.
   * @returns Created document with ID.
   */
  async create<T = any>(collection: string, data: any): Promise<T> {
    try {
      log.info(`Creating document in ${collection}`);
      const result = await this.engine.collection<any>(collection).insert(data);
      log.info(`Document created in ${collection}`);
      return result;
    } catch (error) {
      log.error(
        `Create failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update documents matching a filter.
   * @param collection Collection name.
   * @param filter Filter criteria for matching documents.
   * @param update Partial document with fields to update.
   * @returns Number of documents updated.
   */
  async update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number> {
    try {
      log.info(`Updating documents in ${collection}`);
      const count = await this.engine
        .collection<any>(collection)
        .update(filter, update, true);
      log.info(`Updated ${count} documents in ${collection}`);
      return count;
    } catch (error) {
      log.error(
        `Update failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Delete documents matching a filter.
   * @param collection Collection name.
   * @param filter Filter criteria for matching documents.
   * @returns Number of documents deleted.
   * @throws Error if filter is empty (prevents accidental deletion).
   */
  async delete<T = any>(
    collection: string,
    filter: Filter<T>,
  ): Promise<number> {
    try {
      if (!filter || Object.keys(filter).length === 0) {
        throw new Error(
          "Delete requires at least one filter condition. Prevent full collection deletion.",
        );
      }

      log.info(`Deleting documents from ${collection}`);
      const count = await this.engine
        .collection<any>(collection)
        .delete(filter, true);
      log.info(`Deleted ${count} documents from ${collection}`);
      return count;
    } catch (error) {
      log.error(
        `Delete failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Count documents matching a filter.
   * @param collection Collection name.
   * @param filter Filter criteria for matching documents.
   * @returns Number of matching documents.
   */
  async count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    try {
      log.info(`Counting documents in ${collection}`);
      const count = await this.engine
        .collection<any>(collection)
        .count(filter);
      log.info(`Count in ${collection}: ${count}`);
      return count;
    } catch (error) {
      log.error(
        `Count failed in ${collection}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
