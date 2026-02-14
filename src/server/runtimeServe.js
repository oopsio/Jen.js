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
const cache = new Map();
function etagOf(s) {
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
export function buildHydrationModule(filePath) {
  // filePath comes from server-side route.filePath (absolute)
  // compile TS/TSX -> browser ESM
  if (!existsSync(filePath)) {
    return `export default function Page(){ return null }`;
  }
  const key = filePath;
  const prev = cache.get(key);
  const src = readFileSync(filePath, "utf8");
  const js = buildSync({
    stdin: {
      contents: src,
      resolveDir: filePath.split("/").slice(0, -1).join("/"),
      sourcefile: filePath,
      loader: filePath.endsWith(".tsx")
        ? "tsx"
        : filePath.endsWith(".jsx")
          ? "jsx"
          : filePath.endsWith(".ts")
            ? "ts"
            : "js",
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
  }).outputFiles?.[0]?.text;
  const out =
    `
import { h } from "https://esm.sh/preact@10.25.4";
import { Fragment } from "https://esm.sh/preact@10.25.4";
import { jsx, jsxs } from "https://esm.sh/preact@10.25.4/jsx-runtime";
` + js;
  const etag = etagOf(out);
  cache.set(key, { js: out, etag });
  return out;
}
export function getHydrationEtag(filePath) {
  const v = cache.get(filePath);
  return v?.etag ?? null;
}
