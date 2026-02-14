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

// Client-side Hot Module Replacement (HMR) / Live Reload
// Injected into the browser during development

export const HMR_CLIENT_SCRIPT = `
(function() {
  console.log("[Jen.js] Connecting to HMR...");
  const evt = new EventSource("/__hmr");

  evt.onopen = () => console.log("[Jen.js] HMR Connected");

  evt.addEventListener("reload", () => {
    console.log("[Jen.js] Reloading...");
    window.location.reload();
  });

  evt.addEventListener("style-update", (e) => {
    const file = JSON.parse(e.data).file; // e.g., "styles.css"
    console.log("[Jen.js] Style update:", file);
    
    // Find matching link tags
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
      const url = new URL(link.href);
      if (url.pathname.endsWith(file)) {
        // Force reload by updating query param
        url.searchParams.set("t", Date.now());
        link.href = url.toString();
        console.log("[Jen.js] Updated stylesheet:", file);
      }
    }
  });

  evt.onerror = () => {
    // console.log("[Jen.js] HMR disconnected, retrying...");
    // EventSource automatically retries
  };
})();
`;
