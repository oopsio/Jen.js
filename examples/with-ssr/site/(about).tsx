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

import { h } from "preact";
import type { LoaderContext } from "../../../src/core/types.js";

/**
 * Static page loader - no dynamic data.
 * This demonstrates that loaders are optional.
 * Even static pages can benefit from running server-side logic (auth checks, redirects, etc.)
 */
export const loader = async (ctx: LoaderContext) => {
  // Check if user is authenticated (example)
  const isAuthenticated = !!ctx.cookies.auth_token;

  return {
    pageTitle: "About Jen.js",
    lastUpdated: new Date().toISOString().split("T")[0],
    isAuthenticated,
  };
};

/**
 * Head component for this page.
 */
export function Head() {
  return (
    <>
      <title>About - Jen.js SSR Example</title>
      <meta
        name="description"
        content="Learn about Jen.js server-side rendering framework and its capabilities"
      />
    </>
  );
}

/**
 * About page - static content, but still server-rendered.
 * No client-side JavaScript needed for this page.
 */
export default function AboutPage({ data }: any) {
  return (
    <div class="about-page">
      <div class="navbar">
        <h1>ℹ️ About</h1>
        <p class="subtitle">
          {data?.pageTitle || "Learn about this example"}
        </p>
      </div>

      <div class="container">
        <section class="section">
          <a href="/" style={{ color: "#667eea", marginBottom: "1rem" }}>
            ← Back to Home
          </a>

          <h2 style={{ marginTop: "1rem" }}>About This Example</h2>
          <p>
            This is a complete server-side rendering (SSR) example for Jen.js,
            demonstrating best practices for building fast, SEO-friendly web
            applications.
          </p>
        </section>

        <section class="section">
          <h2>📚 What is Server-Side Rendering?</h2>
          <div class="card">
            <p>
              Server-Side Rendering means your web application is rendered on
              the server and sent to the client as complete HTML. Unlike
              client-side rendering where the browser downloads JavaScript and
              builds the page, SSR provides immediate content to visitors.
            </p>

            <h3 style={{ marginTop: "1.5rem" }}>Key Advantages:</h3>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "1rem" }}>
              <li style={{ marginBottom: "0.75rem" }}>
                ⚡ <strong>Fast Initial Load</strong> - No waiting for JavaScript
                to execute
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                🔍 <strong>Better SEO</strong> - Search engines see all content
                in the HTML
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                📱 <strong>Mobile Friendly</strong> - Less JavaScript means
                better performance on slower devices
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                🔐 <strong>More Secure</strong> - Server-side logic is hidden
                from the client
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                ♿ <strong>Better Accessibility</strong> - Content is available
                before JavaScript loads
              </li>
            </ul>
          </div>
        </section>

        <section class="section">
          <h2>🎯 How Jen.js SSR Works</h2>
          <div class="card">
            <h3>The Request Flow:</h3>
            <ol style={{ paddingLeft: "1.5rem", marginTop: "1rem" }}>
              <li style={{ marginBottom: "1rem" }}>
                <strong>Client makes request</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Browser requests a page, e.g., GET /posts/123
                </p>
              </li>
              <li style={{ marginBottom: "1rem" }}>
                <strong>Route matching</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Framework matches URL to route file, e.g., posts/($id).tsx
                </p>
              </li>
              <li style={{ marginBottom: "1rem" }}>
                <strong>Loader execution</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Loader function runs with access to request context
                </p>
              </li>
              <li style={{ marginBottom: "1rem" }}>
                <strong>Data fetching</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Query database, API, cache, or other server resources
                </p>
              </li>
              <li style={{ marginBottom: "1rem" }}>
                <strong>Component rendering</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Preact renders component to HTML string using loader data
                </p>
              </li>
              <li style={{ marginBottom: "1rem" }}>
                <strong>HTML response</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Complete, fully-rendered HTML sent to client
                </p>
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Client displays page</strong>
                <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                  Browser displays content immediately; optional hydration
                  enables interactivity
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section class="section">
          <h2>🚀 Features Demonstrated</h2>
          <div class="grid">
            <div class="card">
              <h3>✓ Static Routes</h3>
              <p>
                Pages like this one use <code>(about).tsx</code> pattern to
                create <code>/about</code> routes.
              </p>
            </div>
            <div class="card">
              <h3>✓ Dynamic Routes</h3>
              <p>
                Routes like <code>posts/($id).tsx</code> create dynamic pages
                with parameters: <code>/posts/:id</code>
              </p>
            </div>
            <div class="card">
              <h3>✓ Loader Functions</h3>
              <p>
                <code>export const loader</code> fetches data on the server
                before rendering.
              </p>
            </div>
            <div class="card">
              <h3>✓ Head Component</h3>
              <p>
                <code>export function Head</code> customizes{" "}
                <code>&lt;head&gt;</code> section with SEO meta tags.
              </p>
            </div>
            <div class="card">
              <h3>✓ Request Context</h3>
              <p>
                Loaders receive <code>url</code>, <code>params</code>,{" "}
                <code>query</code>, <code>headers</code>, <code>cookies</code>.
              </p>
            </div>
            <div class="card">
              <h3>✓ Multiple Route Types</h3>
              <p>
                Mix static pages, dynamic routes, and blog posts in one
                application.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>📁 Project Structure</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            <code>{`with-ssr/
├── site/
│   ├── (home).tsx          # Route: /
│   ├── (blog).tsx          # Route: /blog
│   ├── (about).tsx         # Route: /about (this page)
│   ├── posts/
│   │   └── ($id).tsx       # Route: /posts/:id
│   └── styles.scss         # Global styles
├── jen.config.ts           # Framework configuration
└── package.json            # Dependencies`}</code>
          </pre>
        </section>

        <section class="section">
          <h2>🔧 Key Configuration</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            <code>{`// jen.config.ts
const config: FrameworkConfig = {
  siteDir: "site",           // Where routes are located
  distDir: "dist",           // Build output directory
  
  rendering: {
    defaultMode: "ssr",      // ssr, ssg, isr, ppr
    defaultRevalidateSeconds: 3600,
  },
  
  server: {
    port: 3000,
    hostname: "localhost",
  },
};`}</code>
          </pre>
        </section>

        <section class="section">
          <h2>🌟 Example: Loader + Component Pattern</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            <code>{`// Route file: posts/($id).tsx
import type { LoaderContext } from "jenjs";

// 1. Server-side data loading
export const loader = async (ctx: LoaderContext) => {
  const postId = ctx.params.id;      // Route param
  const userId = ctx.query.author;   // Query string
  const auth = ctx.cookies.auth;     // Cookie data
  
  const post = await db.posts.get(postId);
  const author = await db.users.get(post.authorId);
  
  return { post, author };
};

// 2. SEO Head component
export function Head({ data }) {
  return <title>{data.post.title}</title>;
}

// 3. Page component (receives loader data)
export default function PostPage({ data }) {
  return (
    <>
      <h1>{data.post.title}</h1>
      <p>By {data.author.name}</p>
      <article>{data.post.content}</article>
    </>
  );
}`}</code>
          </pre>
        </section>

        <section class="section">
          <h2>💡 When to Use SSR</h2>
          <div class="grid">
            <div class="card">
              <h3>✓ Good for SSR</h3>
              <ul style={{ paddingLeft: "1rem", margin: "1rem 0" }}>
                <li>Content-heavy sites</li>
                <li>Blogs and news sites</li>
                <li>E-commerce product pages</li>
                <li>Documentation</li>
                <li>SEO-critical pages</li>
              </ul>
            </div>
            <div class="card">
              <h3>⚠️ Trade-offs</h3>
              <ul style={{ paddingLeft: "1rem", margin: "1rem 0" }}>
                <li>Higher server load</li>
                <li>Server resources needed</li>
                <li>Cache complexity</li>
                <li>Session management</li>
                <li>Database scalability</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>🎯 Next Steps</h2>
          <div class="grid">
            <a href="/" class="button">
              Home
            </a>
            <a href="/blog" class="button">
              Blog
            </a>
            <a href="/posts/1" class="button">
              View Post
            </a>
          </div>
        </section>

        <section class="section">
          <p style={{ fontSize: "0.9rem", color: "#999", textAlign: "center" }}>
            Page last updated: {data?.lastUpdated}
          </p>
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
