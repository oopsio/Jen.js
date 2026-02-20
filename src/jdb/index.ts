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

/**
 * JDB (Jen Database) - A lightweight embedded JSON database for Jen.js applications.
 *
 * JDB provides MongoDB-like CRUD operations with file-based or in-memory storage.
 * Perfect for small to medium applications that need data persistence without external dependencies.
 *
 * Features:
 * - MongoDB-like query syntax with filter operators ($eq, $gt, $in, $regex, etc.)
 * - Atomic update operations ($set, $inc, $push, etc.)
 * - Pagination, sorting, and filtering
 * - Lazy loading and deferred writes for performance
 * - In-memory mode for testing
 * - Simple JSON file format for easy inspection and migration
 *
 * @example
 * import { JDBEngine, type ICollection, type Document } from '@src/jdb';
 *
 * interface User extends Document {
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 *
 * const db = new JDBEngine({ root: './data' });
 * await db.connect();
 *
 * const users = db.collection<User>('users');
 * const user = await users.insert({ name: 'John', email: 'john@example.com', age: 30 });
 * const found = await users.findOne({ email: 'john@example.com' });
 * await users.update({ _id: user._id }, { $set: { age: 31 } });
 * await users.delete({ _id: user._id });
 */

export * from "./types";
export { JDBEngine } from "./engine";
