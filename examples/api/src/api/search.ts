/**
 * Search API with query parameters
 * GET /api/search?q=term&limit=10&offset=0
 */

import type { ApiRequest, ApiResponse } from "../../../../src/api";

interface SearchResult {
  id: number;
  title: string;
  description: string;
  relevance: number;
}

// Mock data
const allItems: SearchResult[] = [
  {
    id: 1,
    title: "Jen.js Framework",
    description: "Lightweight SSG framework",
    relevance: 0.95,
  },
  {
    id: 2,
    title: "Preact",
    description: "Lightweight React alternative",
    relevance: 0.85,
  },
  {
    id: 3,
    title: "TypeScript",
    description: "Type-safe JavaScript",
    relevance: 0.8,
  },
  {
    id: 4,
    title: "API Routes",
    description: "File-based API routing",
    relevance: 0.9,
  },
  {
    id: 5,
    title: "SSG",
    description: "Static Site Generation",
    relevance: 0.75,
  },
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Get query parameters with defaults
  const q = String(req.query.q || "");
  const limit = Math.min(parseInt(String(req.query.limit || "10"), 10), 100);
  const offset = Math.max(parseInt(String(req.query.offset || "0"), 10), 0);

  if (!q.trim()) {
    return res.status(400).json({
      error: "Search query required",
      example: "/api/search?q=framework&limit=10",
    });
  }

  // Simple search (case-insensitive)
  const query = q.toLowerCase();
  const results = allItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    )
    .sort((a, b) => b.relevance - a.relevance)
    .slice(offset, offset + limit);

  res.status(200).json({
    query: q,
    count: results.length,
    total: allItems.length,
    limit,
    offset,
    results,
  });
}
