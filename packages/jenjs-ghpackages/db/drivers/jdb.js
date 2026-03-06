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
import { JDBEngine } from "../../jdb";
export class JDBDriver {
  engine;
  constructor(config) {
    const jdbConfig = config.jdb || {
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
  async query(q) {
    if (typeof q === "string") {
      throw new Error(
        "Raw string queries not supported in JDB directly. Use object syntax.",
      );
    }
    if ("sql" in q) {
      throw new Error("SQL queries not supported in JDB driver.");
    }
    const query = q;
    const coll = this.engine.collection(query.find);
    return await coll.find(query.where || {}, query.options);
  }
  async create(collection, data) {
    return await this.engine.collection(collection).insert(data);
  }
  async update(collection, filter, update) {
    return await this.engine
      .collection(collection)
      .update(filter, update, true);
  }
  async delete(collection, filter) {
    return await this.engine.collection(collection).delete(filter, true);
  }
  async count(collection, filter) {
    return await this.engine.collection(collection).count(filter);
  }
}
