import { h } from "preact";
import { useState } from "preact/hooks";
import { Island } from "../../../src/runtime/islands.js";

/**
 * Counter Component - Interactive island
 * This component will be hydrated on the client
 */
const CounterImpl = ({ initial = 0 }: { initial: number }) => {
  const [count, setCount] = useState(initial);

  return (
    <div
      style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h2>Interactive Counter</h2>
      <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: "pointer",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Increment
      </button>
      <button
        onClick={() => setCount(count - 1)}
        style={{
          marginLeft: "0.5rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: "pointer",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Decrement
      </button>
    </div>
  );
};

// Mark as island with "load" strategy (hydrate immediately)
export const Counter = Island(CounterImpl, "load");

/**
 * Home Page - Demonstrates Islands
 *
 * Features:
 * - Static HTML content
 * - Interactive Counter island (hydrated on client)
 * - Mixed static + interactive
 */
export default function Home() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>🚀 Jen.js Release 16 Features</h1>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          Explore the new framework features: Islands, Middleware, API Routes,
          and Zero-JS
        </p>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <h2>1. Islands - Partial Hydration 🏝️</h2>
        <p>
          This page demonstrates the Islands feature. The counter below is an
          interactive island that only hydrates the necessary JavaScript on the
          client. The rest of the page is pure static HTML.
        </p>
        <Counter initial={5} />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Example: How It Works</h2>
        <ol style={{ lineHeight: "1.8" }}>
          <li>Server renders the page with the counter HTML</li>
          <li>Server emits a hydration marker comment for the counter</li>
          <li>Client receives HTML + marker</li>
          <li>Client hydrates only the counter with JavaScript</li>
          <li>Rest of the page stays static HTML</li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Hydration Strategies</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            <strong>load</strong> - Hydrate immediately (this counter)
          </li>
          <li>
            <strong>idle</strong> - Hydrate when browser idle (non-critical
            features)
          </li>
          <li>
            <strong>visible</strong> - Hydrate when scrolled into view
            (below-fold)
          </li>
        </ul>
        <p>
          Check out{" "}
          <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
            (interactive).tsx
          </code>{" "}
          to see multiple islands with different strategies.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Navigation</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            <a
              href="/about"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              About (Zero-JS Page)
            </a>{" "}
            - Pure static HTML
          </li>
          <li>
            <a
              href="/interactive"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Interactive (Multiple Islands)
            </a>
          </li>
          <li>
            <a
              href="/dashboard"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Dashboard (Middleware)
            </a>{" "}
            - Protected with middleware
          </li>
          <li>
            <a
              href="/blog/hello-world"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Blog (Dynamic Zero-JS)
            </a>{" "}
            - Blog posts
          </li>
          <li>
            <a
              href="/docs"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Docs (Zero-JS)
            </a>{" "}
            - Documentation
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>API Examples</h2>
        <p>Try these endpoints:</p>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
              GET /api/hello
            </code>{" "}
            - Simple endpoint
          </li>
          <li>
            <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
              GET /api/users
            </code>{" "}
            - Get all users
          </li>
          <li>
            <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
              POST /api/users
            </code>{" "}
            - Create user
          </li>
          <li>
            <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
              GET /api/users/1
            </code>{" "}
            - Get user
          </li>
        </ul>
      </section>

      <footer
        style={{
          borderTop: "1px solid #ccc",
          paddingTop: "1rem",
          color: "#666",
        }}
      >
        <p>
          Jen.js Release 16 - Featuring Islands, Middleware, API Routes, and
          Zero-JS
        </p>
      </footer>
    </div>
  );
}
