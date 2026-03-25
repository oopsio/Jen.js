/**
 * GET /api/hello - Simple greeting endpoint
 *
 * Returns: { message: "Hello, World!" }
 */

import type { APIRequest } from '../../src/core/api-router';
import { APIResponse } from '../../src/core/api-router';

export async function GET(req: APIRequest, res: APIResponse) {
  return res.json({
    message: 'Hello, World!',
    timestamp: new Date().toISOString(),
  });
}
