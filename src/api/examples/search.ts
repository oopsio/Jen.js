/**
 * Example API Route: GET /api/search
 *
 * Example showing query parameter handling
 */

import type { ApiRequest, ApiResponse } from '../index';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const { q, limit = '10' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query parameter' });
  }

  const limitNum = Math.min(parseInt(String(limit), 10) || 10, 100);

  // Simulate search results
  const results = [
    { id: 1, title: `Result for "${q}"`, relevance: 0.95 },
    { id: 2, title: `Another match for "${q}"`, relevance: 0.85 },
    { id: 3, title: `Third result`, relevance: 0.72 },
  ].slice(0, limitNum);

  res.status(200).json({
    query: q,
    count: results.length,
    results,
  });
}
