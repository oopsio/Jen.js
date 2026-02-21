/**
 * Simple Hello World API route
 * GET /api/hello
 */

import type { ApiRequest, ApiResponse } from "../../../../src/api";

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.status(200).json({
    message: "Hello from Jen.js API!",
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}
