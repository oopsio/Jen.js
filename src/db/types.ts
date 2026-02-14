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

import { Filter, Update, QueryOptions } from "../jdb/types";

export type DBType = "jdb" | "sqlite" | "mysql" | "postgres";

export interface DBConfig {
  type: DBType;
  connection?: any; // Connection string or object
  jdb?: {
    root: string;
    inMemory?: boolean;
  };
}

// Unified Query Interface
export type FindQuery<T = any> = {
  find: string; // collection/table name
  where?: Filter<T>; // NoSQL style filter
  options?: QueryOptions;
};

export type SQLQuery = {
  sql: string;
  params?: any[];
};

export type UnifiedQuery<T = any> = FindQuery<T> | SQLQuery | string;

export interface IDBDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(q: UnifiedQuery<T>): Promise<T[]>;
  // CRUD shortcuts
  create<T = any>(collection: string, data: any): Promise<T>;
  update<T = any>(
    collection: string,
    filter: Filter<T>,
    update: Update<T>,
  ): Promise<number>;
  delete<T = any>(collection: string, filter: Filter<T>): Promise<number>;
  count<T = any>(collection: string, filter: Filter<T>): Promise<number>;
}
