import type { LoaderContext } from "../../../../src/core/types.js";

interface PostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  readTime: number;
  category: string;
  relatedPosts: Array<{ slug: string; title: string }>;
}

export default function BlogPost({
  data,
  params,
}: {
  data: PostData;
  params: any;
}) {
  return (
    <main className="blog-post">
      <article>
        <header className="post-header">
          <h1>{data.title}</h1>
          <div className="post-meta">
            <span className="author">By {data.author}</span>
            <span className="date">{data.date}</span>
            <span className="read-time">{data.readTime} min read</span>
            <span className="views">{data.views} views</span>
          </div>
        </header>

        <div className="post-content">
          {data.content
            .split("\n")
            .map(
              (paragraph, i) => paragraph.trim() && <p key={i}>{paragraph}</p>,
            )}
        </div>

        <footer className="post-footer">
          <div className="post-info">
            <span className="category">{data.category}</span>
          </div>

          <div className="sharing">
            <h3>Share this post:</h3>
            <a href="#" className="share-twitter">
              Twitter
            </a>
            <a href="#" className="share-linkedin">
              LinkedIn
            </a>
            <a href="#" className="share-facebook">
              Facebook
            </a>
          </div>
        </footer>
      </article>

      {data.relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2>Related Posts</h2>
          <ul>
            {data.relatedPosts.map((post) => (
              <li key={post.slug}>
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="newsletter-signup">
        <h2>Subscribe for more posts</h2>
        <form>
          <input type="email" placeholder="your@email.com" required />
          <button type="submit">Subscribe</button>
        </form>
      </section>

      <nav className="post-nav">
        <a href="/blog" className="back">
          ← Back to Blog
        </a>
      </nav>
    </main>
  );
}

export function Head({ data }: { data: PostData }) {
  return (
    <>
      <title>{data.title} - Blog</title>
      <meta name="description" content={data.content.substring(0, 160)} />
      <meta property="og:title" content={data.title} />
      <meta property="og:type" content="article" />
      <meta name="author" content={data.author} />
      <meta name="article:published_time" content={data.date} />
    </>
  );
}

export async function loader(ctx: LoaderContext): Promise<PostData> {
  const { slug } = ctx.params;

  // Simulate fetching from database
  const posts: Record<string, PostData> = {
    "getting-started-with-jen-js": {
      id: "1",
      slug: "getting-started-with-jen-js",
      title: "Getting Started with Jen.js",
      content: `
Jen.js is a powerful TypeScript-first framework for building modern web applications.

In this tutorial, we'll cover the basics of setting up a Jen.js project, creating your first pages, and deploying to production.

First, install the framework and create your initial pages using file-based routing. The framework automatically discovers routes from your site directory.

Then, add dynamic content using the loader() function to fetch data server-side. This keeps your application performant and SEO-friendly.

Finally, deploy using the bundling system to create a production-ready distribution.`,
      author: "Sarah Chen",
      date: "2026-01-26",
      views: 1523,
      readTime: 5,
      category: "Tutorial",
      relatedPosts: [
        {
          slug: "building-production-apps",
          title: "Building Production-Grade Apps",
        },
        {
          slug: "typescript-best-practices",
          title: "TypeScript Best Practices",
        },
      ],
    },
    "building-production-apps": {
      id: "2",
      slug: "building-production-apps",
      title: "Building Production-Grade Apps",
      content: `
Building applications for production requires careful planning and best practices.

Key considerations include error handling, performance optimization, security, and scalability.

Start with proper TypeScript configuration for strict type checking. This catches errors early in development.

Then implement comprehensive error handling with try-catch blocks and proper logging.

Finally, optimize your build with bundling and minification to reduce file sizes.`,
      author: "Alex Rivera",
      date: "2026-01-25",
      views: 892,
      readTime: 8,
      category: "Best Practices",
      relatedPosts: [
        {
          slug: "typescript-best-practices",
          title: "TypeScript Best Practices",
        },
      ],
    },
    "typescript-best-practices": {
      id: "3",
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices",
      content: `
TypeScript provides powerful type system features that can make your code more robust.

Use strict mode in your tsconfig.json to enforce strict type checking throughout your project.

Always type your function parameters and return values. This makes your code self-documenting.

Use interfaces for object shapes and types for unions and intersections.

Avoid using 'any' - use 'unknown' when you truly don't know the type, then narrow it down.`,
      author: "Jordan Park",
      date: "2026-01-24",
      views: 654,
      readTime: 6,
      category: "TypeScript",
      relatedPosts: [
        {
          slug: "getting-started-with-jen-js",
          title: "Getting Started with Jen.js",
        },
      ],
    },
  };

  const post = posts[slug];

  if (!post) {
    return {
      id: "404",
      slug: "not-found",
      title: "Post Not Found",
      content: "The post you're looking for doesn't exist.",
      author: "System",
      date: new Date().toISOString().split("T")[0],
      views: 0,
      readTime: 0,
      category: "Error",
      relatedPosts: [],
    };
  }

  return post;
}
