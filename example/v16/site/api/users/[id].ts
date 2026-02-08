/**
 * Single User API Route (Dynamic)
 *
 * Demonstrates:
 * - Dynamic route parameters [id]
 * - Multiple HTTP methods (GET, PUT, DELETE)
 * - Error handling
 * - Different status codes
 *
 * Usage:
 * GET /api/users/1 → Get user by ID
 * PUT /api/users/1 → Update user
 * DELETE /api/users/1 → Delete user
 */

// Reference to users store (in production, this would be a database)
let users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    created: "2024-01-15",
  },
  { id: 2, name: "Bob Smith", email: "bob@example.com", created: "2024-01-20" },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    created: "2024-01-25",
  },
];

/**
 * GET /api/users/[id]
 * Returns a single user by ID
 */
export const GET = async (ctx: any) => {
  const userId = parseInt(ctx.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    ctx.res.statusCode = 404;
    return { error: "User not found" };
  }

  return { user };
};

/**
 * PUT /api/users/[id]
 * Updates a user
 * Body: Partial user object { name?: string, email?: string }
 */
export const PUT = async (ctx: any) => {
  const userId = parseInt(ctx.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    ctx.res.statusCode = 404;
    return { error: "User not found" };
  }

  const { name, email } = ctx.body || {};

  if (name) user.name = name;
  if (email) user.email = email;

  return { user, message: "User updated" };
};

/**
 * DELETE /api/users/[id]
 * Deletes a user
 */
export const DELETE = async (ctx: any) => {
  const userId = parseInt(ctx.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    ctx.res.statusCode = 404;
    return { error: "User not found" };
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);

  return {
    message: "User deleted",
    user: deletedUser,
  };
};
