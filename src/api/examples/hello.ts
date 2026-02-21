/**
 * Example API Route: GET /api/hello
 *
 * Basic example showing JSON response
 */

import type { ApiRequest, ApiResponse } from '../index';

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.status(200).json({
    message: 'Hello from Jen.js API!',
    timestamp: new Date().toISOString(),
  });
}
