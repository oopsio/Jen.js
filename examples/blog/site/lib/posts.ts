/**
 * Post loading utilities
 * Only used at build/server time, not in browser
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  featured?: boolean;
}

/**
 * Load all posts from the posts directory
 */
export function loadPosts(postsDir: string): Post[] {
  const files = readdirSync(postsDir).filter((file) => file.endsWith(".md"));

  const posts: Post[] = files
    .map((file) => {
      const filePath = join(postsDir, file);
      const content = readFileSync(filePath, "utf-8");
      const { data, content: body } = matter(content);

      return {
        slug: file.replace(".md", ""),
        title: data.title || "Untitled",
        excerpt: data.excerpt || body.slice(0, 150).replace(/[#*_]/g, ""),
        author: data.author || "Anonymous",
        date: data.date || new Date().toISOString(),
        featured: data.featured || false,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

/**
 * Load a single post by slug
 */
export function loadPost(postsDir: string, slug: string) {
  const filePath = join(postsDir, `${slug}.md`);
  const content = readFileSync(filePath, "utf-8");
  const { data, content: body } = matter(content);

  return {
    title: data.title || "Untitled",
    author: data.author || "Anonymous",
    date: data.date || new Date().toISOString(),
    body,
    frontmatter: data,
  };
}
