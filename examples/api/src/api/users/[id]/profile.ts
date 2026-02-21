/**
 * Nested dynamic route
 * GET /api/users/[id]/profile
 */

import type { ApiRequest, ApiResponse } from '../../../../../../src/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  bio: string;
  followers: number;
  createdAt: string;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const { id } = req.params;
  const userId = parseInt(String(id), 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'GET') {
    // Mock user data
    const profile: UserProfile = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      bio: 'Jen.js enthusiast',
      followers: Math.floor(Math.random() * 10000),
      createdAt: new Date().toISOString(),
    };

    res.status(200).json({
      data: profile,
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
