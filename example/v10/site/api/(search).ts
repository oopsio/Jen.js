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
