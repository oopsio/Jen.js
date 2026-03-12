import { log } from "../shared/log.js";

/**
 * User type definition for type safety in resolvers.
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * In-memory user store for demonstration.
 * In production, replace with database queries (MongoDB, PostgreSQL, JDB, etc.)
 */
const userStore = new Map<string, User>();
let nextId = 1;

/**
 * GraphQL resolver functions for queries and mutations.
 * Each resolver corresponds to a field defined in the schema.
 * Resolvers receive parent value, arguments, context, and field info.
 */
export const resolvers = {
  /**
   * Simple greeting resolver.
   * @returns A greeting message.
   */
  hello(): string {
    return "Hello from GraphQL!";
  },

  /**
   * Query all users.
   * @returns Array of all users from the store.
   */
  users(): User[] {
    try {
      return Array.from(userStore.values());
    } catch (error) {
      log.error(`Error fetching users: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error("Failed to fetch users");
    }
  },

  /**
   * Get a single user by ID.
   * @param id User ID to query.
   * @returns The user object or null if not found.
   */
  getUserById(id: string): User | null {
    try {
      const user = userStore.get(id);
      return user || null;
    } catch (error) {
      log.error(`Error fetching user ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to fetch user ${id}`);
    }
  },

  /**
   * Create a new user.
   * @param input User data including name and email.
   * @returns The created user object with generated ID.
   */
  createUser(input: { name: string; email: string }): User {
    try {
      if (!input.name || !input.email) {
        throw new Error("Name and email are required");
      }

      const user: User = {
        id: String(nextId++),
        name: input.name,
        email: input.email,
      };

      userStore.set(user.id, user);
      log.info(`Created user ${user.id}: ${user.email}`);
      return user;
    } catch (error) {
      log.error(`Error creating user: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error("Failed to create user");
    }
  },

  /**
   * Update an existing user.
   * @param id User ID to update.
   * @param input Partial user data to update.
   * @returns The updated user object or null if not found.
   */
  updateUser(
    id: string,
    input: Partial<{ name: string; email: string }>,
  ): User | null {
    try {
      const user = userStore.get(id);
      if (!user) {
        return null;
      }

      if (input.name !== undefined) {
        user.name = input.name;
      }
      if (input.email !== undefined) {
        user.email = input.email;
      }

      userStore.set(id, user);
      log.info(`Updated user ${id}`);
      return user;
    } catch (error) {
      log.error(`Error updating user ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to update user ${id}`);
    }
  },

  /**
   * Delete a user by ID.
   * @param id User ID to delete.
   * @returns Confirmation message if deletion was successful.
   */
  deleteUser(id: string): string {
    try {
      const exists = userStore.has(id);
      if (!exists) {
        throw new Error(`User ${id} not found`);
      }

      userStore.delete(id);
      log.info(`Deleted user ${id}`);
      return `User ${id} deleted successfully`;
    } catch (error) {
      log.error(`Error deleting user ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to delete user ${id}`);
    }
  },
};
