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
 * import { JDBEngine, type ICollection, type Document } from '../jdb';
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
