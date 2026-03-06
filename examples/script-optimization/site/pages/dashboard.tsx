/**
 * Dashboard Component - Lazy-loaded
 *
 * This component is split into a separate chunk and loaded on demand
 * Reduces initial bundle size by deferring non-critical UI
 */

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

/**
 * Fetch dashboard data (simulated)
 */
async function fetchDashboardData() {
  // Simulate API call
  await new Promise((r) => setTimeout(r, 500));

  return {
    users: 1234,
    revenue: 456789,
    orders: 98,
    conversionRate: 3.2,
  };
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard load failed:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return h("div", { class: "loading" }, "Loading dashboard...");
  }

  if (!data) {
    return h("div", { class: "error" }, "Failed to load dashboard");
  }

  return h(
    "div",
    { class: "dashboard" },
    h("h2", null, "Dashboard"),
    h(
      "div",
      { class: "metrics" },
      h(
        "div",
        { class: "metric" },
        h("h3", null, data.users),
        h("p", null, "Users"),
      ),
      h(
        "div",
        { class: "metric" },
        h("h3", null, "$" + data.revenue.toLocaleString()),
        h("p", null, "Revenue"),
      ),
      h(
        "div",
        { class: "metric" },
        h("h3", null, data.orders),
        h("p", null, "Orders"),
      ),
      h(
        "div",
        { class: "metric" },
        h("h3", null, data.conversionRate + "%"),
        h("p", null, "Conversion"),
      ),
    ),
  );
}
