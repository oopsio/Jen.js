import { h } from "preact";

/**
 * Documentation Page - Zero-JS Example
 * Pure static documentation site
 */
export const hydrate = false;

export default function Docs() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>📚 Jen.js Documentation</h1>
        <p style={{ color: "#666" }}>
          Quick reference for Jen.js framework features
        </p>
      </header>

      <nav style={{ marginBottom: "2rem" }}>
        <h2>Quick Links</h2>
        <ul style={{ columnCount: 2, columnGap: "2rem", lineHeight: "1.8" }}>
          <li>
            <a
              href="#islands"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Islands
            </a>
          </li>
          <li>
            <a
              href="#middleware"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Middleware
            </a>
          </li>
          <li>
            <a
              href="#api-routes"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              API Routes
            </a>
          </li>
          <li>
            <a
              href="#zero-js"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Zero-JS
            </a>
          </li>
        </ul>
      </nav>

      <section id="islands" style={{ marginBottom: "3rem" }}>
        <h2>Islands Architecture</h2>
        <p>
          Islands allow you to add interactivity to specific components while
          keeping the rest of the page as static HTML.
        </p>

        <h3>Basic Usage</h3>
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`import { Island } from "jenjs";

const CounterImpl = ({ initial }) => {
  const [count, setCount] = createSignal(initial);
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
};

export const Counter = Island(CounterImpl, "load");

export default function Page() {
  return <Counter initial={5} />;
}`}
        </pre>

        <h3>Hydration Strategies</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "1rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Strategy</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>When</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Use For</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem" }}>
                <code style={{ background: "#f5f5f5" }}>load</code>
              </td>
              <td style={{ padding: "0.5rem" }}>Immediately</td>
              <td style={{ padding: "0.5rem" }}>Critical UI</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem" }}>
                <code style={{ background: "#f5f5f5" }}>idle</code>
              </td>
              <td style={{ padding: "0.5rem" }}>Browser idle</td>
              <td style={{ padding: "0.5rem" }}>Non-critical</td>
            </tr>
            <tr>
              <td style={{ padding: "0.5rem" }}>
                <code style={{ background: "#f5f5f5" }}>visible</code>
              </td>
              <td style={{ padding: "0.5rem" }}>Scrolled in view</td>
              <td style={{ padding: "0.5rem" }}>Below-the-fold</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="middleware" style={{ marginBottom: "3rem" }}>
        <h2>Route Middleware</h2>
        <p>
          Middleware runs before rendering a route. Use it for authentication,
          authorization, data loading, and more.
        </p>

        <h3>Basic Usage</h3>
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`export const middleware = async (ctx) => {
  if (!ctx.cookies.auth) {
    return ctx.redirect("/login");
  }
  
  ctx.data.user = await getUser(ctx.cookies.auth);
};

export async function loader(ctx) {
  return { user: ctx.data.user };
}

export default function Page({ data }) {
  return <h1>Welcome {data.user.name}</h1>;
}`}
        </pre>

        <h3>Context Methods</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            <code style={{ background: "#f5f5f5" }}>ctx.redirect(url)</code> -
            Redirect user
          </li>
          <li>
            <code style={{ background: "#f5f5f5" }}>ctx.json(data)</code> -
            Return JSON
          </li>
          <li>
            <code style={{ background: "#f5f5f5" }}>
              ctx.setHeader(key, value)
            </code>{" "}
            - Set header
          </li>
          <li>
            <code style={{ background: "#f5f5f5" }}>ctx.data</code> - Attach
            data for loader
          </li>
        </ul>
      </section>

      <section id="api-routes" style={{ marginBottom: "3rem" }}>
        <h2>API Routes</h2>
        <p>
          Create REST endpoints colocated with your routes. Export HTTP method
          handlers from a TypeScript file in your api/ directory.
        </p>

        <h3>Basic Usage</h3>
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`// site/api/users.ts
export const GET = async (ctx) => {
  const users = await db.users.list();
  return { users };
};

export const POST = async (ctx) => {
  const user = await db.users.create(ctx.body);
  ctx.res.statusCode = 201;
  return { user };
};

// site/api/users/[id].ts
export const GET = async (ctx) => {
  const user = await db.users.findById(ctx.params.id);
  return { user };
};

export const PUT = async (ctx) => {
  const user = await db.users.update(ctx.params.id, ctx.body);
  return { user };
};

export const DELETE = async (ctx) => {
  await db.users.delete(ctx.params.id);
  return { deleted: true };
};`}
        </pre>

        <h3>Supported Methods</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            <code style={{ background: "#f5f5f5" }}>GET</code>,{" "}
            <code style={{ background: "#f5f5f5" }}>POST</code>,{" "}
            <code style={{ background: "#f5f5f5" }}>PUT</code>,{" "}
            <code style={{ background: "#f5f5f5" }}>PATCH</code>,{" "}
            <code style={{ background: "#f5f5f5" }}>DELETE</code>,{" "}
            <code style={{ background: "#f5f5f5" }}>HEAD</code>,{" "}
            <code style={{ background: "#f5f5f5" }}>OPTIONS</code>
          </li>
        </ul>
      </section>

      <section id="zero-js" style={{ marginBottom: "3rem" }}>
        <h2>Zero-JS Pages</h2>
        <p>
          Create pages that render as pure HTML with no client-side JavaScript.
          Perfect for static content like docs, blogs, and landing pages.
        </p>

        <h3>Basic Usage</h3>
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
  return <h1>Pure HTML Page</h1>;
}`}
        </pre>

        <h3>Benefits</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li>✅ Zero JavaScript overhead</li>
          <li>✅ Fastest possible load time</li>
          <li>✅ Better SEO</li>
          <li>✅ Works without JavaScript</li>
          <li>✅ Accessible to all users</li>
        </ul>

        <h3>Compatible With</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li>✅ Loaders (fetch data)</li>
          <li>✅ Middleware (auth, etc.)</li>
          <li>✅ SSG and SSR</li>
          <li>❌ Islands (no JavaScript)</li>
          <li>❌ Client-side interactions</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Best Practices</h2>
        <ol style={{ lineHeight: "1.8" }}>
          <li>
            <strong>Use Islands for critical UI only</strong> - Keep JS minimal
          </li>
          <li>
            <strong>Prefer "idle" and "visible" strategies</strong> - Defer
            non-critical JS
          </li>
          <li>
            <strong>Use Zero-JS for static content</strong> - Blogs, docs,
            landing pages
          </li>
          <li>
            <strong>Keep middleware lightweight</strong> - Cache expensive
            operations
          </li>
          <li>
            <strong>Use API routes for backend logic</strong> - Keep routes pure
          </li>
        </ol>
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
