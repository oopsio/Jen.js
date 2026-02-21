/**
 * Example Catch-All API Route: GET /api/files/[...slug]
 *
 * Example showing catch-all dynamic routes for file paths
 * Matches: /api/files/a, /api/files/a/b, /api/files/a/b/c, etc.
 */

import type { ApiRequest, ApiResponse } from '../../index';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const { slug } = req.params;

  // slug will be an array of path segments
  // /api/files/docs/readme.md -> slug = ['docs', 'readme.md']
  // /api/files/a/b/c -> slug = ['a', 'b', 'c']

  const filePath = Array.isArray(slug) ? slug.join('/') : slug;

  if (req.method === 'GET') {
    res.status(200).json({
      message: 'File resource',
      path: filePath,
      segments: slug,
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
