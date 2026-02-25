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
 * GraphQL resolvers placeholder module.
 *
 * Jen.js provides basic example resolvers to demonstrate the pattern.
 * Replace these with your actual resolvers that implement your application logic.
 *
 * Resolvers are functions that return the data for each field in your GraphQL schema.
 * They have access to the parent value, arguments, context, and field info.
 *
 * @example
 * // Custom resolver with database integration:
 * import { db } from '../jdb';
 *
 * export const resolvers = {
 *   users: async () => {
 *     const users = db.collection('users');
 *     return await users.find({});
 *   },
 *   createUser: async ({ name, email }: { name: string; email: string }) => {
 *     const users = db.collection('users');
 *     return await users.insert({ name, email });
 *   }
 * };
 */

/**
 * Example user type for resolver demonstrations.
 * Replace with your actual types defined in your schema.
 */
interface User {
  id: string;
  name: string;
  email: string;
}

/** In-memory user store for example resolvers. Replace with database queries. */
const users: User[] = [];

/**
 * Example resolvers for user queries and mutations.
 * These are simple demonstrations using an in-memory store.
 * In a real application, resolvers should query your database (JDB, etc.).
 */
export const resolvers = {
  /**
   * Query all users.
   * @returns Array of all users.
   */
  users: () => users,

  /**
   * Create a new user.
   * @param name User's full name.
   * @param email User's email address.
   * @returns The created user object with an ID.
   */
  createUser: ({ name, email }: { name: string; email: string }) => {
    const user = { id: (users.length + 1).toString(), name, email };
    users.push(user);
    return user;
  },
};

