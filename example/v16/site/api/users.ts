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
