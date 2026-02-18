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

export declare const HMR_CLIENT_SCRIPT =
  '\n(function() {\n  console.log("[Jen.js] Connecting to HMR...");\n  const evt = new EventSource("/__hmr");\n\n  evt.onopen = () => console.log("[Jen.js] HMR Connected");\n\n  evt.addEventListener("reload", () => {\n    console.log("[Jen.js] Reloading...");\n    window.location.reload();\n  });\n\n  evt.addEventListener("style-update", (e) => {\n    const file = JSON.parse(e.data).file; // e.g., "styles.css"\n    console.log("[Jen.js] Style update:", file);\n    \n    // Find matching link tags\n    const links = document.querySelectorAll(\'link[rel="stylesheet"]\');\n    for (const link of links) {\n      const url = new URL(link.href);\n      if (url.pathname.endsWith(file)) {\n        // Force reload by updating query param\n        url.searchParams.set("t", Date.now());\n        link.href = url.toString();\n        console.log("[Jen.js] Updated stylesheet:", file);\n      }\n    }\n  });\n\n  evt.onerror = () => {\n    // console.log("[Jen.js] HMR disconnected, retrying...");\n    // EventSource automatically retries\n  };\n})();\n';
