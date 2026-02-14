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
import type { RouteMiddlewareContext } from "../../../src/core/middleware-hooks.js";

/**
 * Protected Dashboard - Demonstrates Route Middleware
 *
 * Features:
 * - Route middleware for authentication
 * - Redirect if no auth token
 * - Data passing from middleware to loader to page
 * - Protected resource access
 */

// Middleware runs before the page is rendered
export const middleware = async (ctx: RouteMiddlewareContext) => {
  // In SSR, check auth and redirect
  // In SSG (build time), skip redirect and just load demo data
  const authToken = ctx.cookies.auth;
  const isSSG = !ctx.req.socket; // SSG passes mock req without socket

  if (!authToken && !isSSG) {
    // In SSR: No auth token - redirect to login
    return ctx.redirect("/login", 302);
  }

  // Always load user data (for both SSR and SSG)
  // In a real app, this would verify JWT or session
  ctx.data.user = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    joinDate: "2024-01-15",
  };

  ctx.data.stats = {
    visits: 1234,
    engaged_users: 567,
    revenue: 9876.54,
    growth: "23%",
  };
};

// Loader receives data from middleware via ctx.data
export async function loader(ctx: any) {
  return {
    user: ctx.data.user,
    stats: ctx.data.stats,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Dashboard Page
 * Only renders if middleware passes (user is authenticated)
 */
export default function Dashboard({ data }: { data: any }) {
  const { user, stats, timestamp } = data;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <header
        style={{
          marginBottom: "2rem",
          borderBottom: "2px solid #2563eb",
          paddingBottom: "1rem",
        }}
      >
        <h1>📊 Dashboard</h1>
        <p style={{ color: "#666" }}>Welcome back, {user.name}!</p>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Your Profile</h2>
        <div
          style={{
            background: "#f9fafb",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Member Since:</strong> {user.joinDate}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Your Statistics</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#eff6ff",
              padding: "1rem",
              borderRadius: "8px",
              borderLeft: "4px solid #2563eb",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e40af" }}>
              Total Visits
            </h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
              {stats.visits.toLocaleString()}
            </p>
          </div>

          <div
            style={{
              background: "#fef2f2",
              padding: "1rem",
              borderRadius: "8px",
              borderLeft: "4px solid #dc2626",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#991b1b" }}>
              Engaged Users
            </h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
              {stats.engaged_users}
            </p>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              padding: "1rem",
              borderRadius: "8px",
              borderLeft: "4px solid #16a34a",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#15803d" }}>
              Revenue
            </h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
              ${stats.revenue.toFixed(2)}
            </p>
          </div>

          <div
            style={{
              background: "#fef3c7",
              padding: "1rem",
              borderRadius: "8px",
              borderLeft: "4px solid #eab308",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#854d0e" }}>Growth</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
              {stats.growth}
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>How This Page Works</h2>
        <div
          style={{
            background: "#f9fafb",
            padding: "1rem",
            borderRadius: "8px",
            lineHeight: "1.8",
          }}
        >
          <ol>
            <li>When you visit this page, middleware runs first</li>
            <li>
              Middleware checks for{" "}
              <code style={{ background: "#fff", padding: "0.25rem 0.5rem" }}>
                ctx.cookies.auth
              </code>
            </li>
            <li>
              If no token: redirect to{" "}
              <code style={{ background: "#fff", padding: "0.25rem 0.5rem" }}>
                /login
              </code>
            </li>
            <li>
              If token exists: load user data and attach to{" "}
              <code style={{ background: "#fff", padding: "0.25rem 0.5rem" }}>
                ctx.data
              </code>
            </li>
            <li>
              Loader receives{" "}
              <code style={{ background: "#fff", padding: "0.25rem 0.5rem" }}>
                ctx.data
              </code>{" "}
              and passes to page
            </li>
            <li>Page renders with user data</li>
          </ol>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Route Middleware Features</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            🔐 <strong>Authentication</strong> - Check tokens, sessions, etc.
          </li>
          <li>
            🛡️ <strong>Authorization</strong> - Check permissions, roles
          </li>
          <li>
            📊 <strong>Data Loading</strong> - Fetch data before rendering
          </li>
          <li>
            🔀 <strong>Redirects</strong> - Redirect unauthorized users
          </li>
          <li>
            📝 <strong>Logging</strong> - Log requests, track analytics
          </li>
          <li>
            ⚙️ <strong>Response Headers</strong> - Set cache, CORS, etc.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Testing the Middleware</h2>
        <div
          style={{
            background: "#fef3c7",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>Currently:</strong> You have the auth cookie set (that's how
            you see this page)
          </p>
          <p>
            <strong>To test the redirect:</strong>
          </p>
          <ol>
            <li>
              Clear cookies:{" "}
              <code style={{ background: "#fff", padding: "0.25rem 0.5rem" }}>
                document.cookie = "auth=; max-age=0"
              </code>
            </li>
            <li>Refresh this page</li>
            <li>
              You'll be redirected to{" "}
              <code style={{ background: "#fff", padding: "0.25rem 0.5rem" }}>
                /login
              </code>
            </li>
          </ol>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid #ccc",
          paddingTop: "1rem",
          color: "#666",
        }}
      >
        <p>Last updated: {new Date(timestamp).toLocaleString()}</p>
        <p>
          <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
            ← Back to Home
          </a>{" "}
          |
          <a
            href="/login"
            style={{
              color: "#2563eb",
              textDecoration: "underline",
              marginLeft: "1rem",
            }}
          >
            Logout →
          </a>
        </p>
      </footer>
    </div>
  );
}
