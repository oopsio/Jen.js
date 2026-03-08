import { h } from "preact";

/**
 * Blog Post Page - Dynamic Zero-JS Route
 *
 * Features:
 * - export const hydrate = false (pure static HTML)
 * - Dynamic routes using [slug] parameter
 * - Loader fetches post data
 * - No JavaScript needed
 */

export const hydrate = false;

// Mock blog post database
const blogPosts: Record<string, any> = {
  "hello-world": {
    title: "Hello World",
    slug: "hello-world",
    author: "Jane Doe",
    date: "2026-02-03",
    readTime: "5 min read",
    excerpt: "Welcome to the Jen.js blog! This is our first post.",
    content: `
      <p>Welcome to the Jen.js blog! We're excited to share our thoughts on web development, performance, and building amazing sites with Jen.js.</p>
      
      <h2>What is Jen.js?</h2>
      <p>Jen.js is a modern TypeScript-first framework for building static-generated and server-rendered sites with Preact. It combines the best of both worlds:</p>
      <ul>
        <li>Static Site Generation (SSG) for blazing-fast performance</li>
        <li>Server-Side Rendering (SSR) for dynamic content</li>
        <li>Islands architecture for selective client-side interactivity</li>
        <li>Zero-JS pages for pure static content</li>
      </ul>

      <h2>Why We Built Jen.js</h2>
      <p>Traditional frameworks have become increasingly complex. We wanted to create something simpler, faster, and more aligned with modern web standards.</p>

      <h2>What's Next?</h2>
      <p>Stay tuned for more posts on:</p>
      <ul>
        <li>Performance optimization techniques</li>
        <li>SEO best practices</li>
        <li>Building interactive components with Islands</li>
        <li>Deploying static sites</li>
      </ul>
    `,
  },
  "islands-explained": {
    title: "Islands Architecture Explained",
    slug: "islands-explained",
    author: "John Smith",
    date: "2026-02-02",
    readTime: "8 min read",
    excerpt:
      "Deep dive into the Islands architecture and how it improves web performance.",
    content: `
      <p>The Islands architecture is a modern approach to building web applications that balances interactivity with performance.</p>

      <h2>The Problem</h2>
      <p>Traditional Single Page Applications (SPAs) bundle all JavaScript upfront, which can result in:</p>
      <ul>
        <li>Large initial bundle sizes</li>
        <li>Slow Time to Interactive (TTI)</li>
        <li>Poor performance on slow networks</li>
        <li>Unnecessary JavaScript for static content</li>
      </ul>

      <h2>The Solution: Islands</h2>
      <p>The Islands architecture solves these problems by:</p>
      <ol>
        <li>Rendering pages as static HTML by default</li>
        <li>Only sending JavaScript for interactive components ("islands")</li>
        <li>Hydrating islands independently</li>
        <li>Deferring hydration based on priority</li>
      </ol>

      <h2>Benefits</h2>
      <ul>
        <li>Smaller JavaScript bundles</li>
        <li>Faster Time to Interactive</li>
        <li>Better Core Web Vitals</li>
        <li>Improved SEO</li>
        <li>Works with JavaScript disabled</li>
      </ul>

      <h2>Getting Started with Islands</h2>
      <p>With Jen.js, using Islands is simple. Just mark your interactive components and Jen.js handles the rest!</p>
    `,
  },
  "zero-js-pages": {
    title: "The Power of Zero-JS Pages",
    slug: "zero-js-pages",
    author: "Alice Johnson",
    date: "2026-02-01",
    readTime: "6 min read",
    excerpt: "Why zero-JS pages are the future of web design.",
    content: `
      <p>This blog post itself is an example of a Zero-JS page! It's pure HTML with no JavaScript.</p>

      <h2>What Are Zero-JS Pages?</h2>
      <p>Zero-JS pages are web pages that don't require any client-side JavaScript to function. They're pure HTML, CSS, and sometimes a bit of server-side rendering.</p>

      <h2>Use Cases</h2>
      <ul>
        <li>Blog posts and articles</li>
        <li>Documentation sites</li>
        <li>Landing pages</li>
        <li>Marketing pages</li>
        <li>About pages</li>
        <li>Contact pages</li>
        <li>Legal pages (Terms, Privacy)</li>
      </ul>

      <h2>Advantages</h2>
      <ul>
        <li>✅ Minimal page weight</li>
        <li>✅ Maximum performance</li>
        <li>✅ Better accessibility</li>
        <li>✅ Better SEO</li>
        <li>✅ Works everywhere</li>
      </ul>

      <h2>In Jen.js</h2>
      <p>Creating a Zero-JS page in Jen.js is as simple as adding one line:</p>
      <pre><code>export const hydrate = false;</code></pre>

      <h2>Recommended Reading</h2>
      <ul>
        <li><a href="/blog/islands-explained">Islands Architecture Explained</a></li>
        <li><a href="/about">About Jen.js</a></li>
      </ul>
    `,
  },
};

// Loader fetches the blog post data
export async function loader(ctx: any) {
  const post = blogPosts[ctx.params.slug];

  if (!post) {
    throw new Error(`Blog post not found: ${ctx.params.slug}`);
  }

  return { post };
}

/**
 * Blog Post Page Component
 */
export default function BlogPost({ data }: { data: any }) {
  const { post } = data;

  return (
    <article style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <header
        style={{
          marginBottom: "2rem",
          borderBottom: "2px solid #2563eb",
          paddingBottom: "1rem",
        }}
      >
        <h1>{post.title}</h1>
        <div style={{ color: "#666", fontSize: "0.9rem" }}>
          <span>By {post.author}</span>
          <span> • {post.date}</span>
          <span> • {post.readTime}</span>
        </div>
        <p style={{ color: "#999", marginTop: "0.5rem", fontStyle: "italic" }}>
          {post.excerpt}
        </p>
      </header>

      <section style={{ lineHeight: "1.8", marginBottom: "2rem" }}>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </section>

      <section
        style={{
          background: "#f9fafb",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginTop: 0 }}>About This Page</h3>
        <p>
          This blog post is a <strong>Zero-JS page</strong>. It contains no
          client-side JavaScript, just pure HTML and CSS. This makes it
          incredibly fast and accessible.
        </p>
        <p>
          Try it: Open your DevTools and disable JavaScript. This page will
          still work perfectly!
        </p>
      </section>

      <nav style={{ borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
        <h3>Other Posts</h3>
        <ul style={{ lineHeight: "1.8" }}>
          {Object.values(blogPosts).map(
            (p: any) =>
              p.slug !== post.slug && (
                <li key={p.slug}>
                  <a
                    href={`/blog/${p.slug}`}
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                  >
                    {p.title}
                  </a>
                </li>
              ),
          )}
        </ul>
      </nav>

      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid #ccc",
          color: "#666",
        }}
      >
        <p>
          <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
            ← Back to Home
          </a>
        </p>
      </footer>
    </article>
  );
}
