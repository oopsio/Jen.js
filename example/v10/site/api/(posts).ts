import type { IncomingMessage, ServerResponse } from "node:http";

interface Post {
  id: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  views: number;
}

// Mock database
const posts: Post[] = [
  {
    id: "1",
    slug: "getting-started-with-jen-js",
    title: "Getting Started with Jen.js",
    author: "Sarah Chen",
    date: "2026-01-26",
    views: 1523,
  },
  {
    id: "2",
    slug: "building-production-apps",
    title: "Building Production-Grade Apps",
    author: "Alex Rivera",
    date: "2026-01-25",
    views: 892,
  },
  {
    id: "3",
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices",
    author: "Jordan Park",
    date: "2026-01-24",
    views: 654,
  },
];

export async function handle(req: IncomingMessage, res: ServerResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET") {
    // Get all posts or filter by author
    const url = new URL(req.url || "/", "http://localhost");
    const author = url.searchParams.get("author");

    const filtered = author
      ? posts.filter((p) =>
          p.author.toLowerCase().includes(author.toLowerCase()),
        )
      : posts;

    res.writeHead(200);
    res.end(
      JSON.stringify({
        success: true,
        data: filtered,
        count: filtered.length,
      }),
    );
  } else if (req.method === "POST") {
    // Create new post (stub)
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const newPost = JSON.parse(body);

        if (!newPost.title || !newPost.author) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Missing required fields" }));
          return;
        }

        const post: Post = {
          id: String(posts.length + 1),
          slug: newPost.title.toLowerCase().replace(/\s+/g, "-"),
          title: newPost.title,
          author: newPost.author,
          date: new Date().toISOString().split("T")[0],
          views: 0,
        };

        posts.push(post);

        res.writeHead(201);
        res.end(
          JSON.stringify({
            success: true,
            data: post,
          }),
        );
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
}
