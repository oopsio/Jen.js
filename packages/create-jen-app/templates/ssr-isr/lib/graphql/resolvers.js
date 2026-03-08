/** In-memory user store for example resolvers. Replace with database queries. */
const users = [];
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
  createUser: ({ name, email }) => {
    const user = { id: (users.length + 1).toString(), name, email };
    users.push(user);
    return user;
  },
};
