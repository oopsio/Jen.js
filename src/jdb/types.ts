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

export type JDBConfig = {
  root: string; // Directory to store .jdb files
  inMemory?: boolean; // If true, don't write to disk (for testing)
};

export type Document = Record<string, any> & {
  _id: string;
  _created: number;
  _updated: number;
};

export type FilterOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin"
  | "$regex";

export type Filter<T = any> = {
  [K in keyof T]?: T[K] | { [op in FilterOperator]?: any };
} & {
  $or?: Filter<T>[];
  $and?: Filter<T>[];
};

export type UpdateOperator = "$set" | "$unset" | "$inc" | "$push" | "$pull";

export type Update<T = any> = {
  [op in UpdateOperator]?: Partial<T> | Record<string, any>;
};

export type QueryOptions = {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
};

export interface IDatabaseEngine {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  collection(name: string): ICollection;
}

export interface ICollection<T extends Document = Document> {
  name: string;
  insert(
    doc: Omit<T, "_id" | "_created" | "_updated"> & { _id?: string },
  ): Promise<T>;
  insertMany(
    docs: (Omit<T, "_id" | "_created" | "_updated"> & { _id?: string })[],
  ): Promise<T[]>;
  findOne(filter: Filter<T>): Promise<T | null>;
  find(filter: Filter<T>, options?: QueryOptions): Promise<T[]>;
  update(
    filter: Filter<T>,
    update: Update<T>,
    multi?: boolean,
  ): Promise<number>;
  delete(filter: Filter<T>, multi?: boolean): Promise<number>;
  count(filter: Filter<T>): Promise<number>;
}
