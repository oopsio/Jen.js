import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Island } from "../../../src/runtime/islands.js";

/**
 * Multiple Islands Demo - showing different hydration strategies
 */

// Strategy 1: Load immediately
const CounterLoadImpl = ({ initial = 0 }: { initial: number }) => {
  const [count, setCount] = useState(initial);
  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #2563eb",
        borderRadius: "8px",
        background: "#eff6ff",
      }}
    >
      <h3>Counter (load strategy)</h3>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: "0.5rem 1rem",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        +1
      </button>
    </div>
  );
};

// Strategy 2: Hydrate on idle
const TimerIdleImpl = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #16a34a",
        borderRadius: "8px",
        background: "#f0fdf4",
      }}
    >
      <h3>Timer (idle strategy)</h3>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{seconds}s</p>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Hydrated when browser idle
      </p>
    </div>
  );
};

// Strategy 3: Hydrate when visible
const FormVisibleImpl = () => {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #dc2626",
        borderRadius: "8px",
        background: "#fee2e2",
      }}
    >
      <h3>Newsletter (visible strategy)</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="your@email.com"
          value={message}
          onInput={(e) => setMessage(e.currentTarget.value)}
          style={{
            padding: "0.5rem",
            width: "200px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Subscribe
        </button>
      </form>
      {submitted && (
        <p style={{ color: "#991b1b", fontWeight: "bold" }}>
          ✅ Thanks for subscribing!
        </p>
      )}
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Hydrated when scrolled into view
      </p>
    </div>
  );
};

export const CounterLoad = Island(CounterLoadImpl, "load");
export const TimerIdle = Island(TimerIdleImpl, "idle");
export const FormVisible = Island(FormVisibleImpl, "visible");

/**
 * Interactive Page - Multiple Islands
 */
export default function Interactive() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>🎯 Multiple Islands Demo</h1>
        <p style={{ color: "#666" }}>
          This page demonstrates different hydration strategies for islands
        </p>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Island Hydration Strategies</h2>
        <p>
          Jen.js supports three strategies for hydrating islands. Each strategy
          is optimized for different use cases:
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3>1. Load Strategy (Immediate)</h3>
        <p>
          The <strong>load</strong> strategy hydrates components immediately
          when the page loads. Use this for critical, above-the-fold interactive
          components.
        </p>
        <CounterLoad initial={0} />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3>2. Idle Strategy (Deferred)</h3>
        <p>
          The <strong>idle</strong> strategy hydrates components when the
          browser is idle (using requestIdleCallback). Use this for non-critical
          features that don't need immediate interactivity.
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          ℹ️ This timer is hydrated when the browser is idle, not immediately.
        </p>
        <TimerIdle />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3>3. Visible Strategy (Lazy)</h3>
        <p>
          The <strong>visible</strong> strategy hydrates components when they
          scroll into view (using IntersectionObserver). Use this for
          below-the-fold components like modals, popovers, etc.
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          ℹ️ Scroll down to see the newsletter form hydrate!
        </p>

        {/* Add some space to force scrolling */}
        <div
          style={{
            height: "400px",
            background: "#f9fafb",
            borderRadius: "8px",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ textAlign: "center", color: "#999" }}>
            ↓ Scroll down to hydrate the newsletter form ↓
          </p>
        </div>

        <FormVisible />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Performance Benefits</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>✅ Only hydrate what's needed</li>
          <li>✅ Defer non-critical JS</li>
          <li>✅ Lazy-load below-the-fold components</li>
          <li>✅ Reduce initial JS bundle size</li>
          <li>✅ Faster Time to Interactive (TTI)</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>How to Use</h2>
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`import { Island } from "jenjs";

// Define component
const MyComponent = ({ prop }) => { /* ... */ };

// Mark as island with strategy
export const MyIsland = Island(MyComponent, "load");   // immediate
export const MyIsland = Island(MyComponent, "idle");   // deferred
export const MyIsland = Island(MyComponent, "visible"); // lazy

// Use in JSX
export default function Page() {
  return <MyIsland prop="value" />;
}
`}
        </pre>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Browser Support</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>✅ load - All browsers</li>
          <li>✅ idle - Modern browsers (requestIdleCallback)</li>
          <li>✅ visible - Modern browsers (IntersectionObserver)</li>
          <li>⚠️ Older browsers fall back to load strategy</li>
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
          <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
            ← Back to Home
          </a>
        </p>
      </footer>
    </div>
  );
}
