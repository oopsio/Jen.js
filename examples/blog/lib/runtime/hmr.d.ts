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
export declare const HMR_CLIENT_SCRIPT = "\n(function() {\n  console.log(\"[Jen.js] Connecting to HMR...\");\n  const evt = new EventSource(\"/__hmr\");\n\n  evt.onopen = () => console.log(\"[Jen.js] HMR Connected\");\n\n  // Full page reload on route or component changes\n  evt.addEventListener(\"reload\", () => {\n    console.log(\"[Jen.js] Reloading...\");\n    window.location.reload();\n  });\n\n  // CSS-only reload without full page reload (faster UX for style-only changes)\n  evt.addEventListener(\"style-update\", (e) => {\n    const file = JSON.parse(e.data).file; // e.g., \"styles.css\"\n    console.log(\"[Jen.js] Style update:\", file);\n    \n    // Find matching link tags by pathname\n    const links = document.querySelectorAll('link[rel=\"stylesheet\"]');\n    for (const link of links) {\n      const url = new URL(link.href);\n      if (url.pathname.endsWith(file)) {\n        // Force reload by updating cache-busting query param (timestamp)\n        url.searchParams.set(\"t\", Date.now());\n        link.href = url.toString();\n        console.log(\"[Jen.js] Updated stylesheet:\", file);\n      }\n    }\n  });\n\n  evt.onerror = () => {\n    // Connection closed; EventSource automatically retries\n    // (commented out: chatty in development; uncomment if needed for debugging)\n    // console.log(\"[Jen.js] HMR disconnected, retrying...\");\n  };\n})();\n";
