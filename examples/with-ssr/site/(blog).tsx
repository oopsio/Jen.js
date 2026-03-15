import { h } from "preact";
import type { LoaderContext, RouteModule } from "../../../src/core/types.js";

/**
 * Simulated blog post database.
 * In real applications, this would be a database query.
 */
const mockBlogPosts = [
  {
    id: 1,
    title: "Getting Started with Jen.js SSR",
    excerpt: "Learn how to build server-side rendered applications...",
    author: "John Doe",
    date: "2025-03-15",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Dynamic Data Loading with Loaders",
    excerpt: "Master the loader function pattern for server data fetching...",
    author: "Jane Smith",
    date: "2025-03-10",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "SEO Optimization Tips",
    excerpt: "Maximize your search engine visibility with SSR...",
    author: "Bob Johnson",
    date: "2025-03-05",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Performance Best Practices",
    excerpt: "Tips for keeping your SSR application fast and responsive...",
    author: "Alice Brown",
    date: "2025-02-28",
    readTime: "10 min read",
  },
  {
    id: 5,
    title: "Caching Strategies for SSR",
    excerpt:
      "Learn how to implement intelligent caching for better performance...",
    author: "Charlie Wilson",
    date: "2025-02-20",
    readTime: "7 min read",
  },
];

/**
 * Server-side loader: Fetch blog posts.
 * This runs on the server and data is passed to the component.
 * The rendered HTML includes all post data - no additional JS fetch needed.
 */
export const loader = async (ctx: LoaderContext) => {
  // Simulate database query delay
  await new Promise((r) => setTimeout(r, 100));

  // In real app: const posts = await db.posts.findAll();
  return {
    posts: mockBlogPosts,
    count: mockBlogPosts.length,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Head component for this page.
 */
export function Head({ data }: any) {
  return (
    <>
      <title>Blog - Jen.js SSR Example</title>
      <meta
        name="description"
        content={`Read our blog - ${data?.count || 0} articles about Jen.js and SSR`}
      />
      <meta property="og:title" content="Jen.js Blog" />
    </>
  );
}

/**
 * Blog listing page.
 * All posts are server-rendered and included in the initial HTML.
 * No additional API calls needed on the client side.
 */
export default function BlogPage({ data, query }: any) {
  const posts = data?.posts || [];

  return (
    <div class="blog-page">
      <div class="navbar">
        <h1> Blog</h1>
        <p class="subtitle">Articles about Jen.js and Server-Side Rendering</p>
      </div>

      <div class="container">
        <section class="section">
          <a href="/" style={{ color: "#667eea", marginBottom: "1rem" }}>
            ← Back to Home
          </a>

          <h2 style={{ marginTop: "1rem" }}>
            Latest Articles ({posts.length} total)
          </h2>
          <p style={{ color: "#999", fontSize: "0.9rem" }}>
            Last updated: {new Date(data?.timestamp).toLocaleDateString()}
          </p>
        </section>

        <section class="section">
          {posts.length > 0 ? (
            <ul class="posts-list">
              {posts.map((post: any) => (
                <li key={post.id}>
                  <a href={`/posts/${post.id}`} style={{ fontSize: "1.1rem" }}>
                    {post.title}
                  </a>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>
                    {post.excerpt}
                  </p>
                  <div
                    class="post-meta"
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span> {post.author}</span>
                    <span> {post.date}</span>
                    <span>⏱️ {post.readTime}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p class="loading">No posts found.</p>
          )}
        </section>

        <section class="section">
          <h2> About This Example</h2>
          <div class="card">
            <h3>Server-Side Rendering Benefits:</h3>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "1rem" }}>
              <li style={{ marginBottom: "0.75rem" }}>
                <strong>Complete HTML</strong> - All blog posts are in the
                initial page HTML
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <strong>Fast Load</strong> - No waiting for JavaScript to
                execute and fetch data
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <strong>SEO Ready</strong> - Search engines see all content
                immediately
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <strong>Works Offline</strong> - Page is usable before
                JavaScript loads
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <strong>Smaller Bundle</strong> - No need to ship data fetching
                code to client
              </li>
            </ul>
          </div>
        </section>

        <section class="section">
          <h2> Loader Pattern</h2>
          <p>
            The <code>loader</code> function in this route file fetches blog
            posts from the database during server-side rendering. The result is
            automatically passed to the page component as the <code>data</code>{" "}
            prop.
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
              marginTop: "1rem",
            }}
          >
            <code>{`export const loader = async (ctx: LoaderContext) => {
  // Runs on the server at request time
  const posts = await db.posts.findAll();
  return { posts };
};

export default function BlogPage({ data }) {
  return (
    <ul>
      {data.posts.map(post => (
        <li key={post.id}>
          <a href={\`/posts/\${post.id}\`}>
            {post.title}
          </a>
        </li>
      ))}
    </ul>
  );
}`}</code>
          </pre>
        </section>

        <section class="section">
          <h2> What's Next?</h2>
          <div class="grid">
            <a href="/posts/1" class="button">
              Read First Post →
            </a>
            <a href="/about" class="button">
              About Page →
            </a>
            <a href="/" class="button">
              Back to Home →
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
