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
 * import { db } from '@src/jdb';
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
/**
 * Example resolvers for user queries and mutations.
 * These are simple demonstrations using an in-memory store.
 * In a real application, resolvers should query your database (JDB, etc.).
 */
export declare const resolvers: {
    /**
     * Query all users.
     * @returns Array of all users.
     */
    users: () => User[];
    /**
     * Create a new user.
     * @param name User's full name.
     * @param email User's email address.
     * @returns The created user object with an ID.
     */
    createUser: ({ name, email }: {
        name: string;
        email: string;
    }) => {
        id: string;
        name: string;
        email: string;
    };
};
export {};
