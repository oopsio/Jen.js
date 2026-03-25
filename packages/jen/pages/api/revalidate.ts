/**
 * POST /api/revalidate - On-demand ISR revalidation webhook
 *
 * This endpoint is typically called by a CMS (like Contentful, Strapi, etc.)
 * whenever content is updated, to trigger immediate cache revalidation.
 *
 * Usage:
 * curl -X POST http://localhost:3000/api/revalidate \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer your-secret-token" \
 *   -d '{"path": "/blog/post-1"}'
 */

import type { APIRequest } from '../../src/core/api-router';
import { APIResponse } from '../../src/core/api-router';
import { jen } from '../../src/client';

// Replace with your actual secret token from environment
const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET || 'your-secret-token';

export async function POST(req: APIRequest, res: APIResponse) {
  // Verify authorization token
  const authHeader = req.headers?.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== REVALIDATION_SECRET) {
    return res.setStatus(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing revalidation token',
    });
  }

  // Validate request body
  const body = req.body as
    | { path?: string; recursive?: boolean }
    | null
    | undefined;
  if (!body || !body.path) {
    return res.setStatus(400).json({
      error: 'Bad Request',
      message: 'Missing required field: path',
    });
  }

  const { path, recursive } = body;

  try {
    // Trigger revalidation
    const result = await jen.revalidate(path, { recursive });

    return res.json({
      success: result.success,
      message: result.message,
      path: result.path,
      revalidatedAt: result.revalidatedAt,
      duration: result.duration,
    });
  } catch (error) {
    console.error('[Revalidation Error]', error);

    return res.setStatus(500).json({
      error: 'Revalidation Failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * GET /api/revalidate - Health check
 * Shows webhook endpoint status
 */
export async function GET(req: APIRequest, res: APIResponse) {
  return res.json({
    status: 'ok',
    message: 'On-demand revalidation endpoint is ready',
    endpoint: '/api/revalidate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer your-secret-token',
    },
    body: {
      path: '/blog/post-1',
      recursive: false,
    },
  });
}
