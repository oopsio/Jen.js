/**
 * Home Page - Example script optimization
 *
 * Features demonstrated:
 * - Tree-shaking: Only enabled features included
 * - Code splitting: Route-specific code in separate chunk
 * - Lazy-loading: Dashboard loaded on demand
 */

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

// Lazy-load dashboard (creates separate chunk)
// @lazy-load:"dashboard"
const loadDashboard = () => import("./dashboard.js");

export default function HomePage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadDashboard = async () => {
    try {
      setError(null);
      const mod = await loadDashboard();
      // Render lazily-loaded component
      setShowDashboard(true);
    } catch (err) {
      setError(String(err));
    }
  };

  return h(
    "div",
    { class: "container" },
    h("h1", null, "Script Optimization Example"),
    h("p", null, "This example demonstrates:"),
    h(
      "ul",
      null,
      h("li", null, "Tree-shaking: Disabled features removed from bundle"),
      h("li", null, "Code splitting: Route chunks + vendor chunk"),
      h("li", null, "Lazy-loading: Dashboard loads on demand"),
      h("li", null, "Auto-hashing: Filenames hashed for cache-busting"),
      h("li", null, "Cache-busting: Long-term caching with content hashes"),
    ),
    h("h2", null, "Performance Metrics"),
    h(
      "dl",
      null,
      h("dt", null, "Initial Bundle Size"),
      h("dd", null, "~15 KB (gzipped)"),
      h("dt", null, "Lazy Dashboard"),
      h("dd", null, "~8 KB (loaded on demand)"),
    ),
    h("h2", null, "Lazy-Loaded Content"),
    !showDashboard
      ? h(
          "button",
          { onClick: handleLoadDashboard, class: "btn btn-primary" },
          "Load Dashboard (lazy)",
        )
      : h(
          "div",
          { class: "dashboard-container" },
          h("p", null, "Dashboard loaded!"),
          h("pre", null, "Check the Network tab to see lazy chunks loaded."),
        ),
    error && h("div", { class: "error" }, h("strong", null, "Error: "), error),
  );
}

/**
 * Static route metadata for the framework
 */
export const route = {
  title: "Home - Script Optimization",
  description: "Learn about tree-shaking, code splitting, and lazy-loading",
  render: "ssg",
};
