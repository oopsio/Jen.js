import { DBConfig, IDBDriver } from "./types";
/**
 * Factory class for creating database driver instances.
 * The DBConnector uses the factory pattern to instantiate the appropriate driver
 * based on the configured database type. This allows the application to support
 * multiple database backends without tight coupling to any single implementation.
 *
 * Supported database types:
 * - jdb: Embedded JSON database (built-in, no external dependencies)
 * - sqlite: SQLite relational database
 * - postgres: PostgreSQL relational database
 * - mysql: MySQL relational database
 */
export declare class DBConnector {
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
     * const config: DBConfig = { type: 'sqlite', path: './data.db' };
     * const driver = DBConnector.create(config);
     * const records = await driver.query('SELECT * FROM users');
     */
    static create(config: DBConfig): IDBDriver;
}
