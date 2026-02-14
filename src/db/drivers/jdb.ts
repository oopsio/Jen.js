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

import { IDBDriver, DBConfig, UnifiedQuery, FindQuery } from "../types";
import { JDBEngine, JDBConfig } from "../../jdb";
import { Filter, Update } from "../../jdb/types";

export class JDBDriver implements IDBDriver {
  private engine: JDBEngine;

  constructor(config: DBConfig) {
    const jdbConfig: JDBConfig = config.jdb || {
      root: "./data",
      inMemory: false,
    };
    this.engine = new JDBEngine(jdbConfig);
  }

  async connect() {
    await this.engine.connect();
  }

  async disconnect() {
    await this.engine.disconnect();
  }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    if (typeof q === "string") {
      throw new Error(
        "Raw string queries not supported in JDB directly. Use object syntax.",
      );
    }
    if ("sql" in q) {
      throw new Error("SQL queries not supported in JDB driver.");
    }

    const query = q as FindQuery<T>;
    const coll = this.engine.collection<any>(query.find);
    return await coll.find(query.where || {}, query.options);
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    return await this.engine.collection<any>(collection).insert(data);
  }

  async update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number> {
    return await this.engine
      .collection<any>(collection)
      .update(filter, update, true);
  }

  async delete<T = any>(
    collection: string,
    filter: Filter<T>,
  ): Promise<number> {
    return await this.engine.collection<any>(collection).delete(filter, true);
  }

  async count<T = any>(collection: string, filter: Filter<T>): Promise<number> {
    return await this.engine.collection<any>(collection).count(filter);
  }
}
