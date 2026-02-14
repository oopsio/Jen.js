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

import type { LoaderContext } from "@src/core/types.js";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  views: number;
  category: string;
}

interface BlogIndexData {
  posts: Post[];
  totalPages: number;
  currentPage: number;
}

export default function BlogIndex({
  data,
  query,
}: {
  data: BlogIndexData;
  query: any;
}) {
  const page = parseInt(query.page || "1");

  return (
    <main className="blog-index">
      <header className="page-header">
        <h1>Blog</h1>
        <p>Latest articles and tutorials</p>
      </header>

      {data.posts.length > 0 ? (
        <>
          <div className="posts-list">
            {data.posts.map((post) => (
              <article key={post.id} className="post-list-item">
                <div className="post-meta">
                  <span className="date">{post.date}</span>
                  <span className="category">{post.category}</span>
                  <span className="views">{post.views} views</span>
                </div>
                <h2>
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h2>
                <p className="excerpt">{post.excerpt}</p>
                <footer>
                  <span className="author">By {post.author}</span>
                  <a href={`/blog/${post.slug}`} className="read-more">
                    Read Article →
                  </a>
                </footer>
              </article>
            ))}
          </div>

          <nav className="pagination">
            {page > 1 && (
              <a href={`/blog?page=${page - 1}`} className="prev">
                ← Previous
              </a>
            )}

            <span className="page-info">
              Page {page} of {data.totalPages}
            </span>

            {page < data.totalPages && (
              <a href={`/blog?page=${page + 1}`} className="next">
                Next →
              </a>
            )}
          </nav>
        </>
      ) : (
        <p className="no-posts">No posts found. Check back soon!</p>
      )}

      <nav className="back-link">
        <a href="/">← Back Home</a>
      </nav>
    </main>
  );
}

export function Head() {
  return (
    <>
      <title>Blog - All Posts</title>
      <meta name="description" content="Read all our blog posts." />
    </>
  );
}

export async function loader(ctx: LoaderContext): Promise<BlogIndexData> {
  const page = parseInt(ctx.query.page || "1");
  const postsPerPage = 10;

  // Simulate fetching posts
  const allPosts: Post[] = [
    {
      id: "1",
      slug: "getting-started-with-jen-js",
      title: "Getting Started with Jen.js",
      excerpt: "Learn how to build your first app with Jen.js framework.",
      author: "Sarah Chen",
      date: "2026-01-26",
      views: 1523,
      category: "Tutorial",
    },
    {
      id: "2",
      slug: "building-production-apps",
      title: "Building Production-Grade Apps",
      excerpt: "Best practices for building scalable applications.",
      author: "Alex Rivera",
      date: "2026-01-25",
      views: 892,
      category: "Best Practices",
    },
    {
      id: "3",
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices",
      excerpt: "Master TypeScript patterns for better code.",
      author: "Jordan Park",
      date: "2026-01-24",
      views: 654,
      category: "TypeScript",
    },
  ];

  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  const startIdx = (page - 1) * postsPerPage;
  const posts = allPosts.slice(startIdx, startIdx + postsPerPage);

  return {
    posts,
    totalPages,
    currentPage: page,
  };
}
