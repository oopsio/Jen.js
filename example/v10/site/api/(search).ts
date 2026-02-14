/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
}

// Mock posts data
const allPosts: Post[] = [
  {
    slug: "getting-started-with-jen-js",
    title: "Getting Started with Jen.js",
    excerpt: "Learn how to build your first app with Jen.js framework.",
  },
  {
    slug: "building-production-apps",
    title: "Building Production-Grade Apps",
    excerpt: "Best practices for building scalable applications.",
  },
  {
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices",
    excerpt: "Master TypeScript patterns for better code.",
  },
];

export async function handle(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    const url = new URL(req.url || "/", "http://localhost");
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Query must be at least 2 characters" }));
      return;
    }

    const searchLower = query.toLowerCase();
    const results = allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower),
    );

    res.writeHead(200);
    res.end(
      JSON.stringify({
        query,
        results,
        count: results.length,
      }),
    );
  } else {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
}
