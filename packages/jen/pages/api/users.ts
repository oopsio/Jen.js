/**
 * /api/users - Users API endpoint
 * 
 * GET /api/users - List all users
 * POST /api/users - Create a new user
 */

import type { APIRequest } from '../../src/core/api-router';
import { APIResponse } from '../../src/core/api-router';

// Mock database
const users: Record<number, { id: number; name: string; email: string }> = {
  1: { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  2: { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  3: { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
};

let nextId = 4;

/**
 * GET /api/users
 * Query params: ?limit=10&offset=0
 */
export async function GET(req: APIRequest, res: APIResponse) {
  const limit = parseInt((req.query?.limit as string) || '10', 10);
  const offset = parseInt((req.query?.offset as string) || '0', 10);

  const userList = Object.values(users).slice(offset, offset + limit);

  return res.json({
    data: userList,
    total: Object.keys(users).length,
    limit,
    offset,
  });
}

/**
 * POST /api/users
 * Body: { name: string, email: string }
 */
export async function POST(req: APIRequest, res: APIResponse) {
  const body = req.body as { name?: string; email?: string } | null | undefined;
  if (!body || !body.name || !body.email) {
    return res.setStatus(400).json({
      error: 'Missing required fields: name, email',
    });
  }

  const newUser = {
    id: nextId++,
    name: body.name,
    email: body.email,
  };

  users[newUser.id] = newUser;

  return res.setStatus(201).json({
    data: newUser,
    message: 'User created successfully',
  });
}
