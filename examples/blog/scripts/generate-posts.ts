/**
 * Build-time script to generate posts data and route pages from markdown files
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  featured?: boolean;
  content: string;
}

function generatePosts() {
  const postsDir = join(process.cwd(), "site/posts");
  const outDir = join(process.cwd(), "site/.generated");
  const siteDir = join(process.cwd(), "site");

  // Create output directory
  mkdirSync(outDir, { recursive: true });

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
        content: body,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write JSON file
  const outFile = join(outDir, "posts.json");
  writeFileSync(outFile, JSON.stringify(posts, null, 2), "utf-8");

  console.log(` Generated ${posts.length} posts to ${outFile}`);

  // Generate individual post pages
  posts.forEach((post) => {
    const htmlContent = marked(post.content);

    const pageContent = `import { h } from "preact";
import { marked } from "marked";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";

const htmlContent = \`${htmlContent}\`;

export function Head() {
  return (
    <>
      <title>${post.title} - Jen.js Blog</title>
      <meta name="description" content="${post.excerpt}" />
    </>
  );
}

export default function BlogPost() {
  const formattedDate = new Date("${post.date}").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page blog-post-page">
      <Header />

      <main>
        <article className="blog-post">
          <div className="container">
            <div className="post-header">
              <h1>${post.title}</h1>
              <div className="post-meta">
                <span className="author">By ${post.author}</span>
                <time dateTime="${post.date}">{formattedDate}</time>
              </div>
            </div>

            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: htmlContent,
              }}
            />

            <div className="post-footer">
              <hr />
              <p className="author-bio">
                Written by <strong>${post.author}</strong>
              </p>
              <a href="/blog" className="back-link">← Back to all posts</a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
`;
    const pageFile = join(siteDir, `(blog-${post.slug}).tsx`);
    writeFileSync(pageFile, pageContent, "utf-8");
  });

  console.log(` Generated ${posts.length} post pages`);

  return posts;
}

generatePosts();
