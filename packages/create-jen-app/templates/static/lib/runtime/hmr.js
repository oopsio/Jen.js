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
/**
 * Client-side Hot Module Replacement (HMR) / Live Reload code.
 * This script is injected into the browser during development mode.
 *
 * Features:
 * - Establishes Server-Sent Events (SSE) connection to /__hmr endpoint
 * - Listens for "reload" events (full page reload on route/component changes)
 * - Listens for "style-update" events (CSS updates without full reload)
 * - Automatically retries connection if lost
 *
 * The script uses IIFE (Immediately Invoked Function Expression) to avoid
 * polluting the global scope.
 *
 * How it works:
 * 1. Server watches file system for changes
 * 2. On change, server sends SSE event to clients
 * 3. Client receives event and either reloads or updates CSS
 * 4. CSS updates use cache-busting query params to force fresh load
 *
 * Only injected in development mode; production builds do not include this.
 */
export const HMR_CLIENT_SCRIPT = `
(function() {
  console.log("[Jen.js] Connecting to HMR...");
  const evt = new EventSource("/__hmr");

  evt.onopen = () => console.log("[Jen.js] HMR Connected");

  // Full page reload on route or component changes
  evt.addEventListener("reload", () => {
    console.log("[Jen.js] Reloading...");
    window.location.reload();
  });

  // CSS-only reload without full page reload (faster UX for style-only changes)
  evt.addEventListener("style-update", (e) => {
    const file = JSON.parse(e.data).file; // e.g., "styles.css"
    console.log("[Jen.js] Style update:", file);
    
    // Find matching link tags by pathname
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
      const url = new URL(link.href);
      if (url.pathname.endsWith(file)) {
        // Force reload by updating cache-busting query param (timestamp)
        url.searchParams.set("t", Date.now());
        link.href = url.toString();
        console.log("[Jen.js] Updated stylesheet:", file);
      }
    }
  });

  evt.onerror = () => {
    // Connection closed; EventSource automatically retries
    // (commented out: chatty in development; uncomment if needed for debugging)
    // console.log("[Jen.js] HMR disconnected, retrying...");
  };
})();
`;
