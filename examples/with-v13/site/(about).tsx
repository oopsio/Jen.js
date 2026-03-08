import { h } from "preact";

export default function About() {
  return (
    <div>
      <header>
        <nav>
          <h1>Jen.js SSG</h1>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
          <button className="btn-primary">Get Started</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>About Jen.js</h1>
          <p>
            A production-ready static site generator built with TypeScript and
            Preact.
          </p>
        </section>

        <section>
          <h2>What Makes Jen.js Special</h2>

          <div className="features">
            <div className="feature">
              <h3>100% Static Output</h3>
              <p>
                Pure HTML, CSS, and JavaScript. No server-side rendering
                required. Deploy anywhere.
              </p>
            </div>
            <div className="feature">
              <h3>Minified Production Build</h3>
              <p>
                Fully minified HTML, CSS, and JavaScript. Critical CSS inlined
                for instant paint.
              </p>
            </div>
            <div className="feature">
              <h3>Asset Hashing</h3>
              <p>
                Automatic asset versioning with SHA-256 hashing. Cache static
                files forever.
              </p>
            </div>
            <div className="feature">
              <h3>Interactive Islands</h3>
              <p>
                Add interactivity only where needed. Minimal JavaScript runtime
                footprint.
              </p>
            </div>
            <div className="feature">
              <h3>Incremental Builds</h3>
              <p>
                Cache-based builds. Only rebuild changed pages. Fast iteration
                for large sites.
              </p>
            </div>
            <div className="feature">
              <h3>SEO Ready</h3>
              <p>
                Automatic sitemap.xml and robots.txt generation. Semantic HTML
                and metadata.
              </p>
            </div>
          </div>

          <h2 style={{ marginTop: "3rem" }}>Architecture</h2>
          <p>
            Jen.js combines the best of static generation and modern
            interactivity:
          </p>
          <ul style={{ marginBottom: "2rem", paddingLeft: "2rem" }}>
            <li>Pre-rendered HTML pages (SSG)</li>
            <li>Critical CSS inlined for speed</li>
            <li>Non-critical CSS deferred (preload + onload)</li>
            <li>Interactive components via islands pattern</li>
            <li>Minified output for production</li>
            <li>Content-based asset hashing</li>
          </ul>

          <h2>Performance</h2>
          <p>Jen.js prioritizes performance at every step:</p>
          <ul style={{ marginBottom: "2rem", paddingLeft: "2rem" }}>
            <li>
              <strong>Fast builds:</strong> &lt; 30s for 1000+ pages
            </li>
            <li>
              <strong>Tiny runtime:</strong> &lt; 1KB hydration script
            </li>
            <li>
              <strong>Smart caching:</strong> Immutable asset headers
            </li>
            <li>
              <strong>Critical CSS:</strong> Above-fold content optimized
            </li>
          </ul>
        </section>
      </main>

      <footer>
        <p>© 2024 Jen.js SSG Example. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function Head() {
  return (
    <>
      <title>About - Jen.js SSG</title>
      <meta
        name="description"
        content="Learn about Jen.js, a production-ready static site generator with minified output, critical CSS optimization, and interactive islands."
      />
    </>
  );
}
