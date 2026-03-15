import { h } from "preact";
import type { LoaderContext, RouteModule } from "../../../../src/core/types.js";

/**
 * Mock blog post data.
 * In real apps, this would come from a database query based on params.id
 */
const mockPosts: Record<string, any> = {
  "1": {
    id: 1,
    title: "Getting Started with Jen.js SSR",
    author: "John Doe",
    date: "2025-03-15",
    readTime: "5 min read",
    content: `
Server-Side Rendering (SSR) is a technique where your web application is rendered on the server instead of in the browser. This approach offers several advantages for modern web applications.

With Jen.js, implementing SSR is straightforward. You define a loader function in your route file that runs on the server before rendering. This function can fetch data from databases, APIs, or other server-side resources.

The loader function receives a context object with access to the request, parameters, query string, headers, and cookies. This allows you to:

- Fetch data based on route parameters (e.g., /posts/123)
- Perform authentication checks using request headers
- Access user information from cookies
- Query databases without exposing credentials to the client

Once the loader completes, your component is rendered to an HTML string and sent to the client. The browser immediately displays the content without waiting for JavaScript to execute.

This approach is perfect for content-heavy sites, blogs, e-commerce platforms, and any application where initial page load performance and SEO are important.
    `,
    comments: 5,
  },
  "2": {
    id: 2,
    title: "Dynamic Data Loading with Loaders",
    author: "Jane Smith",
    date: "2025-03-10",
    readTime: "8 min read",
    content: `
The loader pattern is the core of data management in Jen.js SSR applications. Every route file can export a loader function that runs exclusively on the server.

Unlike client-side data fetching, loaders ensure that data is available before the page renders. This means:

1. No loading spinners while data is being fetched
2. Full access to the data for SEO meta tags
3. No waterfall requests - data loads in parallel with page rendering
4. Security: sensitive operations stay on the server

The loader function is async and can be as simple or complex as needed. You can make multiple database queries, call external APIs, process the data, and return it all in one request-response cycle.

Error handling is straightforward. If your loader throws an error, the framework catches it and shows an error page. You can also return custom responses like redirects or 404 pages from your loader if needed.
    `,
    comments: 12,
  },
  "3": {
    id: 3,
    title: "SEO Optimization Tips",
    author: "Bob Johnson",
    date: "2025-03-05",
    readTime: "6 min read",
    content: `
Search Engine Optimization is crucial for web applications. SSR naturally provides better SEO than client-side rendering because all content is in the initial HTML.

With Jen.js SSR, you can:

1. Include meta tags dynamically based on page content
2. Set title and description from your loader data
3. Add Open Graph tags for social media sharing
4. Include structured data (JSON-LD) for rich snippets
5. Ensure all text content is in the HTML (no JavaScript-dependent rendering)

The Head component export in your route file allows you to customize the document head for each page. Combined with data from the loader, you can create perfectly optimized pages for search engines.

Remember that proper semantic HTML structure also helps with SEO. Use appropriate heading tags, lists, and other semantic elements to organize your content.
    `,
    comments: 8,
  },
};

/**
 * Dynamic route loader: Fetch a single blog post by ID.
 * The route file path is posts/($id).tsx
 * This means the route is /posts/:id and the param name is "id"
 * The id value from the URL is passed via ctx.params.id
 */
export const loader = async (ctx: LoaderContext) => {
  const postId = ctx.params.id;

  // Simulate database query
  const post = mockPosts[postId];

  if (!post) {
    // Return notFound for missing posts
    throw new Error("404: Post not found");
  }

  // Simulate data processing
  await new Promise((r) => setTimeout(r, 50));

  return {
    post,
    relatedPosts: Object.values(mockPosts)
      .filter((p: any) => p.id !== post.id)
      .slice(0, 3),
  };
};

/**
 * Head component - use post data for SEO.
 */
export function Head({ data, params }: any) {
  const post = data?.post;
  return (
    <>
      <title>{post?.title || "Post"} - Jen.js Blog</title>
      <meta name="description" content={post?.excerpt || ""} />
      <meta property="og:title" content={post?.title} />
      <meta property="og:type" content="article" />
      <meta
        property="article:published_time"
        content={post?.date + "T00:00:00Z"}
      />
      <meta property="article:author" content={post?.author} />
    </>
  );
}

/**
 * Dynamic post page.
 * The params.id is available here (extracted from the URL).
 * The post data is available from the loader.
 */
export default function PostPage({ data, params }: any) {
  const post = data?.post;
  const related = data?.relatedPosts || [];

  if (!post) {
    return (
      <div class="container">
        <div class="error">Post not found</div>
      </div>
    );
  }

  return (
    <div class="post-page">
      <div class="navbar">
        <h1> Blog Post</h1>
        <p class="subtitle">Server-rendered dynamic content</p>
      </div>

      <div class="container">
        <a href="/blog" style={{ color: "#667eea", marginBottom: "1rem" }}>
          ← Back to Blog
        </a>

        <article class="post-content">
          <div class="post-header">
            <h1>{post.title}</h1>
            <div class="post-meta">
              <span> {post.author}</span>
              <span> {post.date}</span>
              <span>⏱️ {post.readTime}</span>
            </div>
          </div>

          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
            {post.content}
          </div>

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "2rem",
              borderTop: "1px solid #eee",
            }}
          >
            <p>
              <strong>Comments: </strong>
              {post.comments} {post.comments === 1 ? "comment" : "comments"}
            </p>
          </div>
        </article>

        <section class="section">
          <h2> Related Articles</h2>
          {related.length > 0 ? (
            <div class="grid">
              {related.map((p: any) => (
                <div class="card" key={p.id}>
                  <h3>
                    <a
                      href={`/posts/${p.id}`}
                      style={{ color: "#667eea", textDecoration: "none" }}
                    >
                      {p.title}
                    </a>
                  </h3>
                  <p>{p.excerpt}</p>
                  <p style={{ fontSize: "0.85rem", color: "#999" }}>{p.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No related articles found.</p>
          )}
        </section>

        <section class="section">
          <h2> How This Page Works</h2>
          <div class="card">
            <h3>Dynamic Route Parameters:</h3>
            <p>
              This page uses a dynamic route: <code>/posts/:id</code>
            </p>
            <p>
              The route file is named <code>($id).tsx</code>, which tells the
              framework to capture the id parameter from the URL.
            </p>
            <p>
              The <code>loader</code> function receives{" "}
              <code>ctx.params.id</code> and uses it to fetch the specific post.
            </p>
            <p>
              All rendering happens on the server, so the client receives a
              fully-rendered HTML page with the post content included.
            </p>
          </div>
        </section>

        <section class="section">
          <h2> Navigation</h2>
          <div class="grid">
            <a href="/blog" class="button">
              All Posts →
            </a>
            <a href="/" class="button">
              Home →
            </a>
          </div>
        </section>
      </div>

      <footer>
        <p>Jen.js SSR Example • Server-Side Rendering with Dynamic Data</p>
        <p>
          <a href="https://github.com/oopsio/jen.js" target="_blank">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
