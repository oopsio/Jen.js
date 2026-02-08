/**
 * Users API - using old format
 */

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

export default async function handler(ctx: any) {
  if (ctx.method === "GET") {
    const limit = ctx.query?.limit ? parseInt(ctx.query.limit) : 10;
    const offset = ctx.query?.offset ? parseInt(ctx.query.offset) : 0;
    return {
      users: users.slice(offset, offset + limit),
      total: users.length,
      limit,
      offset,
    };
  }

  if (ctx.method === "POST") {
    const { name, email } = ctx.body || {};
    if (!name || !email) {
      ctx.res.statusCode = 400;
      return { error: "Name and email required" };
    }
    const newUser = {
      id: users.length + 1,
      name,
      email,
      created: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    ctx.res.statusCode = 201;
    return { user: newUser };
  }
}
