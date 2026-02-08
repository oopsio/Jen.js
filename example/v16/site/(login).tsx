import { h } from "preact";
import { useState } from "preact/hooks";
import { Island } from "../../../src/runtime/islands.js";

/**
 * Login Form Component - Interactive Island
 * Uses "load" strategy for immediate hydration
 */
const LoginFormImpl = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate login API call
      if (email() && password()) {
        // Set auth cookie (in real app, would come from server)
        document.cookie = "auth=demo-token-123; path=/; max-age=86400";

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError("Please enter email and password");
        setLoading(false);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Email:
        </label>
        <input
          type="email"
          value={email}
          onInput={(e) => setEmail(e.currentTarget.value)}
          placeholder="your@email.com"
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Password:
        </label>
        <input
          type="password"
          value={password}
          onInput={(e) => setPassword(e.currentTarget.value)}
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.75rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: loading ? "#ccc" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.9rem",
          color: "#666",
          textAlign: "center",
        }}
      >
        Demo: Any email/password works
      </p>
    </form>
  );
};

export const LoginForm = Island(LoginFormImpl, "load");

/**
 * Login Page
 */
export default function Login() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1>🔐 Login</h1>
        <p style={{ color: "#666" }}>
          Enter your credentials to access the dashboard
        </p>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <LoginForm />
      </section>

      <section
        style={{
          background: "#f0fdf4",
          padding: "1rem",
          borderRadius: "8px",
          borderLeft: "4px solid #16a34a",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Demo Login</h3>
        <p>
          This is a demo page. You can use any email and password to log in. The
          system will set an auth cookie and redirect you to the dashboard.
        </p>
        <p>
          <strong>Note:</strong> In a real application, you would validate
          credentials on the server.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", textAlign: "center" }}>How It Works</h2>
        <ol style={{ lineHeight: "1.8", color: "#666" }}>
          <li>
            Login form is an <strong>interactive island</strong> (hydrated on
            client)
          </li>
          <li>Form validation happens on the client</li>
          <li>
            On submit, sets an{" "}
            <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
              auth
            </code>{" "}
            cookie
          </li>
          <li>
            Redirects to{" "}
            <code style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem" }}>
              /dashboard
            </code>
          </li>
          <li>Dashboard middleware checks for the auth cookie</li>
          <li>If present, allows access; otherwise redirects back</li>
        </ol>
      </section>

      <footer style={{ marginTop: "2rem", textAlign: "center", color: "#666" }}>
        <p>
          <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
            ← Back to Home
          </a>
        </p>
      </footer>
    </div>
  );
}
