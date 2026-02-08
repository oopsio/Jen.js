import { h } from "preact";

/**
 * About Page - Demonstrates Zero-JS
 *
 * Features:
 * - export const hydrate = false
 * - Pure static HTML output
 * - Zero JavaScript overhead
 * - Perfect for documentation, landing pages, etc.
 */
export const hydrate = false;

export default function About() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>About Jen.js</h1>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          This page is pure HTML with zero JavaScript
        </p>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <h2>What is Jen.js?</h2>
        <p>
          Jen.js is a modern TypeScript-first framework for building
          static-generated and server-rendered sites with Preact. It combines
          the best of static site generation with the flexibility of server-side
          rendering.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Zero-JS Feature</h2>
        <p>
          This page demonstrates the Zero-JS feature. By setting{" "}
          <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
            export const hydrate = false
          </code>
          , this page is rendered as pure HTML with no JavaScript bundle.
        </p>
        <p>
          Check your Network tab - you'll see there's no hydration script loaded
          for this page. This makes pages extremely fast and is perfect for
          static content.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Benefits of Zero-JS</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>🚀 Blazingly fast page loads (no JS parsing)</li>
          <li>♿ Better accessibility (works without JavaScript)</li>
          <li>🔍 Better SEO (pure HTML parsing)</li>
          <li>📱 Better mobile performance (smaller payload)</li>
          <li>🔒 Better security (no client-side code)</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Use Cases</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>Documentation sites</li>
          <li>Blog posts</li>
          <li>Landing pages</li>
          <li>Marketing pages</li>
          <li>Help/FAQ pages</li>
          <li>About pages</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>How to Use</h2>
        <p>Add this line to any page component:</p>
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`export const hydrate = false;

export default function StaticPage() {
  return <div>Pure HTML content</div>;
}`}
        </pre>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Works With...</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>✅ Loaders (fetch data at build/request time)</li>
          <li>✅ Middleware (auth, authorization, etc.)</li>
          <li>✅ SSG (static site generation)</li>
          <li>✅ SSR (server-side rendering)</li>
          <li>❌ Islands (no JavaScript, so no islands)</li>
          <li>❌ Client-side interactivity</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Example: Blog Post</h2>
        <p>
          Check out our{" "}
          <a
            href="/blog/hello-world"
            style={{ color: "#2563eb", textDecoration: "underline" }}
          >
            blog post
          </a>{" "}
          to see Zero-JS in action with dynamic routes.
        </p>
      </section>

      <footer
        style={{
          borderTop: "1px solid #ccc",
          paddingTop: "1rem",
          color: "#666",
        }}
      >
        <p>
          <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
            ← Back to Home
          </a>
        </p>
      </footer>
    </div>
  );
}
