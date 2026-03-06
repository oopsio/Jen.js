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
import { JDBDriver } from "./drivers/jdb";
import { SQLDriver } from "./drivers/sql";
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
export class DBConnector {
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
  static create(config) {
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
  }
}
