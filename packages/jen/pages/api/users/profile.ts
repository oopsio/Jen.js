/**
 * GET /api/users/profile - Get current user profile
 *
 * Returns the profile of the current authenticated user
 */

import type { APIRequest } from '../../../src/core/api-router';
import { APIResponse } from '../../../src/core/api-router';

export async function GET(req: APIRequest, res: APIResponse) {
  // In a real app, get the user from the authorization header
  const authHeader = req.headers?.get('authorization');

  if (!authHeader) {
    return res.setStatus(401).json({
      error: 'Unauthorized',
      message: 'Authorization header required',
    });
  }

  // Mock user profile
  return res.json({
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00Z',
  });
}
