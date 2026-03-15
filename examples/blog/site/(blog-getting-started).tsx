import { h } from "preact";
import { marked } from "marked";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";

const htmlContent = `<h1>Getting Started with Jen.js</h1>
<p>Jen.js is a powerful, TypeScript-first framework for building static and server-rendered web applications with Preact.</p>
<h2>Why Jen.js?</h2>
<ul>
<li><strong> Lightning Fast</strong>: Optimized builds with automatic code splitting</li>
<li><strong> Type-Safe</strong>: Full TypeScript support with strict mode enabled</li>
<li><strong> Modern SSR</strong>: Server-side rendering with optional hydration</li>
<li><strong> Zero Config</strong>: Works out of the box with sensible defaults</li>
<li><strong> Flexible</strong>: Build anything from static blogs to dynamic web apps</li>
</ul>
<h2>Quick Start</h2>
<pre><code class="language-bash">npm create jen-app@latest my-project
cd my-project
npm run dev
</code></pre>
<h2>Directory Structure</h2>
<pre><code>my-project/
├── site/
│   ├── pages/        # Page routes
│   ├── components/   # Reusable components
│   ├── styles/       # Global styles
│   └── assets/       # Static files
├── lib/              # Framework library
├── jen.config.ts     # Configuration
├── server.ts         # Dev server
└── build.ts          # Build script
</code></pre>
<h2>Creating Your First Page</h2>
<p>Create <code>site/pages/(index).tsx</code>:</p>
<pre><code class="language-tsx">export default function Home() {
  return (
    &lt;div&gt;
      &lt;h1&gt;Welcome to Jen.js&lt;/h1&gt;
      &lt;p&gt;Build modern web apps fast&lt;/p&gt;
    &lt;/div&gt;
  );
}
</code></pre>
<h2>Dynamic Routes</h2>
<p>Dynamic routes use the <code>(param)</code> syntax:</p>
<pre><code>site/pages/(blog)/[slug].tsx
</code></pre>
<p>This creates routes like <code>/blog/my-post</code>.</p>
<h2>Learn More</h2>
<ul>
<li>Check out the <a href="#">documentation</a></li>
<li>Explore <a href="https://github.com/oopsio/jen.js/tree/main/examples">examples</a></li>
<li>Join our <a href="#">community</a></li>
</ul>
<p>Happy building! </p>
`;

export function Head() {
  return (
    <>
      <title>Getting Started with Jen.js - Jen.js Blog</title>
      <meta
        name="description"
        content="Learn how to build fast, modern web applications with Jen.js framework"
      />
    </>
  );
}

export default function BlogPost() {
  const formattedDate = new Date(
    "Sun Feb 22 2026 05:30:00 GMT+0530 (India Standard Time)",
  ).toLocaleDateString("en-US", {
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
              <h1>Getting Started with Jen.js</h1>
              <div className="post-meta">
                <span className="author">By Jen Team</span>
                <time dateTime="Sun Feb 22 2026 05:30:00 GMT+0530 (India Standard Time)">
                  {formattedDate}
                </time>
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
                Written by <strong>Jen Team</strong>
              </p>
              <a href="/blog" className="back-link">
                ← Back to all posts
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
