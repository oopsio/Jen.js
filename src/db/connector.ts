import { DBConfig, IDBDriver } from "./types.js";
import { JDBDriver } from "./drivers/jdb.js";
import { SQLDriver } from "./drivers/sql.js";
import { log } from "../shared/log.js";

/**
 * Factory class for creating and managing database driver instances.
 * The DBConnector uses the factory pattern to instantiate the appropriate driver
 * based on the configured database type. This allows the application to support
 * multiple database backends without tight coupling to any single implementation.
 *
 * Supported database types:
 * - jdb: Embedded JSON database (built-in, no external dependencies)
 * - sqlite: SQLite relational database
 * - postgres: PostgreSQL relational database
 * - mysql: MySQL relational database
 *
 * @example
 * ```typescript
 * // Create JDB driver
 * const jdb = DBConnector.create({ type: 'jdb', jdb: { root: './data' } });
 *
 * // Create SQL driver (SQLite)
 * const sqlite = DBConnector.create({ type: 'sqlite', connection: pool });
 *
 * // Use driver
 * await jdb.connect();
 * await jdb.create('users', { name: 'John' });
 * const users = await jdb.query({ find: 'users' });
 * await jdb.disconnect();
 * ```
 */
export class DBConnector {
  private static instances: Map<string, IDBDriver> = new Map();

  /**
   * Creates and returns a database driver instance based on the configuration.
   * The driver implements the IDBDriver interface and provides the same API
   * regardless of the underlying database type.
   *
   * @param config The database configuration including type and connection parameters.
   * @returns An IDBDriver instance for the specified database type.
   * @throws Error if the configured database type is not supported.
   *
   * @example
   * ```typescript
   * const driver = DBConnector.create({ type: 'jdb' });
   * await driver.connect();
   * ```
   */
  static create(config: DBConfig): IDBDriver {
    try {
      log.info(`Creating database driver for type: ${config.type}`);

      switch (config.type) {
        case "jdb":
          return new JDBDriver(config);
        case "sqlite":
        case "postgres":
        case "mysql":
          return new SQLDriver(config);
        default:
          throw new Error(`Unsupported DB type: ${config.type}`);
      }
    } catch (error) {
      log.error(
        `Failed to create database driver: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get a cached driver instance by key.
   * Useful for managing multiple database connections in a single application.
   *
   * @param key Unique identifier for the driver instance.
   * @returns Cached driver or undefined if not found.
   *
   * @example
   * ```typescript
   * const primary = DBConnector.get('primary');
   * ```
   */
  static get(key: string): IDBDriver | undefined {
    return this.instances.get(key);
  }

  /**
   * Create and cache a driver instance.
   * Allows managing multiple database connections with unique keys.
   *
   * @param key Unique identifier for the driver instance.
   * @param config Database configuration.
   * @returns The created driver instance.
   * @throws Error if key already exists or driver creation fails.
   *
   * @example
   * ```typescript
   * const primary = DBConnector.set('primary', { type: 'jdb' });
   * const secondary = DBConnector.set('secondary', { type: 'sqlite', ... });
   * ```
   */
  static set(key: string, config: DBConfig): IDBDriver {
    try {
      if (this.instances.has(key)) {
        log.info(`Driver instance '${key}' already exists, replacing`);
      }

      const driver = this.create(config);
      this.instances.set(key, driver);
      log.info(`Cached driver instance: ${key}`);
      return driver;
    } catch (error) {
      log.error(
        `Failed to cache driver instance: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Remove a cached driver instance.
   *
   * @param key Unique identifier for the driver instance.
   * @returns True if instance was removed, false if not found.
   */
  static remove(key: string): boolean {
    const removed = this.instances.delete(key);
    if (removed) {
      log.info(`Removed cached driver instance: ${key}`);
    }
    return removed;
  }

  /**
   * Get all cached driver keys.
   * @returns Array of cached driver instance keys.
   */
  static keys(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Clear all cached driver instances.
   * WARNING: Does not disconnect drivers; call disconnect on each before clearing.
   *
   * @example
   * ```typescript
   * for (const key of DBConnector.keys()) {
   *   const driver = DBConnector.get(key);
   *   if (driver) await driver.disconnect();
   * }
   * DBConnector.clear();
   * ```
   */
  static clear(): void {
    const count = this.instances.size;
    this.instances.clear();
    log.info(`Cleared ${count} cached driver instances`);
  }

  /**
   * Get cache statistics.
   * @returns Object with cache info.
   */
  static stats(): { total: number; keys: string[] } {
    return {
      total: this.instances.size,
      keys: this.keys(),
    };
  }
}
