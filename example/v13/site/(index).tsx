import { h } from "preact";
// Newsletter component would be imported here during build
// import Newsletter from "./components/Newsletter.js";

export default function Home() {
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
          <h1>Build Amazing Static Sites</h1>
          <p>
            Production-ready SSG with Jen.js. Minified HTML, optimized CSS, and
            interactive islands.
          </p>
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <button className="btn-primary">Start Building</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <h3>⚡ Lightning Fast</h3>
            <p>
              Fully minified HTML with critical CSS inline. Pre-rendered pages
              load instantly.
            </p>
          </div>
          <div className="feature">
            <h3>🎨 Beautiful Design</h3>
            <p>
              Responsive, semantic HTML. Tailored CSS with deferred loading
              pattern.
            </p>
          </div>
          <div className="feature">
            <h3>🔌 Interactive Islands</h3>
            <p>
              Add interactivity only where needed. Newsletter forms, toggles,
              pagination.
            </p>
          </div>
        </section>

        <section className="newsletter-section">
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto",
              padding: "2rem 1rem",
            }}
          >
            <h2>Stay Updated</h2>
            <p style={{ marginBottom: "2rem", color: "rgba(255,255,255,0.9)" }}>
              Get the latest news and updates delivered to your inbox.
            </p>
            <div id="newsletter-form" data-island="Newsletter">
              <form>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Subscribe
                </button>
              </form>
              <script type="application/json">
                {JSON.stringify({ endpoint: "/api/subscribe" })}
              </script>
            </div>
          </div>
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
      <title>Jen.js SSG Example - Production-Ready Static Site</title>
      <meta
        name="description"
        content="A production-ready SSG example built with Jen.js featuring minified output, critical CSS, and interactive islands."
      />
    </>
  );
}
