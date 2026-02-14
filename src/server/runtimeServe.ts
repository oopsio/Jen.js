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

import { buildSync } from "esbuild";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { vueEsbuildPlugin, svelteEsbuildPlugin } from "../compilers/esbuild-plugins.js";

const cache = new Map<string, { js: string; etag: string }>();

function etagOf(s: string) {
  return createHash("sha1").update(s).digest("hex");
}

export function runtimeHydrateModule() {
  // Browser-safe runtime (ESM) using CDN preact (fast + zero bundler)
  return `
import { hydrate } from "https://esm.sh/preact@10.25.4";
import { h } from "https://esm.sh/preact@10.25.4";

function getFrameworkData() {
  const el = document.getElementById("__FRAMEWORK_DATA__");
  if (!el) return null;
  try { return JSON.parse(el.textContent || "null"); } catch { return null; }
}

export async function hydrateClient(entryPath) {
  const data = getFrameworkData();
  const mod = await import(entryPath);
  const Page = mod.default;
  const app = h(Page, {
    data: data?.data ?? null,
    params: data?.params ?? {},
    query: data?.query ?? {}
  });
  const root = document.getElementById("app");
  if (!root) return;
  hydrate(app, root);
}
`;
}

export function invalidateCache(filePath: string) {
  cache.delete(filePath);
}

export function buildHydrationModule(routeIdOrPath: string) {
  // routeIdOrPath is now a route ID like "route_index" or "route_blog_slug"
  // or a fallback filePath for backwards compatibility

  let filePath = routeIdOrPath;

  // For now, keep simple direct file path support
  // In production, we'd resolve routeId -> filePath via config
  if (!existsSync(filePath)) {
    return `export default function Page(){ return null }`;
  }

  const key = filePath;
  // Simple dev cache: check if file content changed?
  // Actually, for dev speed, we trust explicit invalidation or just rebuild on request.
  // Since buildSync is fast for single files, let's just rebuild if not in cache.
  // The cache is populated. If invalidation happens, it's removed.

  if (cache.has(key)) {
    return cache.get(key)!.js;
  }

  // Use a proxy entry to allow tree-shaking of server-only exports (like loader)
  const fileName = basename(filePath);
  const dir = dirname(filePath);
  const proxyContent = `export { default } from "./${fileName}";`;

  try {
    const jsOutput = buildSync({
      stdin: {
        contents: proxyContent,
        resolveDir: dir,
        sourcefile: "hydration-proxy.tsx",
        loader: "tsx",
      },
      format: "esm",
      platform: "browser",
      bundle: true,
      write: false,
      sourcemap: "inline",
      jsx: "automatic",
      jsxImportSource: "preact",
      define: {
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
      external: [
        "preact",
        "preact/hooks",
        "preact/jsx-runtime",
        "preact-render-to-string",
      ],
      // Plugins not supported in buildSync, only in build()
      // plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
    }).outputFiles?.[0]?.text;
    
    if (!jsOutput) {
      console.error("[HYDRATION] Failed to build module for:", filePath);
      return `export default function Page(){ return null }`;
    }
    
    const out =
      `
import { h } from "https://esm.sh/preact@10.25.4";
import { Fragment } from "https://esm.sh/preact@10.25.4";
import { jsx, jsxs } from "https://esm.sh/preact@10.25.4/jsx-runtime";
` + jsOutput;

    const etag = etagOf(out);
    cache.set(key, { js: out, etag });
    return out;
  } catch (err) {
    console.error("[HYDRATION] Build error for", filePath, ":", err);
    return `export default function Page(){ return null }`;
  }
}

export function getHydrationEtag(filePath: string) {
  const v = cache.get(filePath);
  return v?.etag ?? null;
}
