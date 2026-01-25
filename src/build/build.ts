import { mkdirSync, rmSync, writeFileSync, existsSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import type { FrameworkConfig } from "../core/config.js";
import { scanRoutes } from "../core/routes/scan.js";
import { resolveDistPath } from "../core/paths.js";
import { log } from "../shared/log.js";
import { renderRouteToHtml } from "../runtime/render.js";

function copyDir(src: string, dst: string) {
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });

  for (const name of readdirSync(src)) {
    const sp = join(src, name);
    const dp = join(dst, name);
    const st = statSync(sp);

    if (st.isDirectory()) copyDir(sp, dp);
    else copyFileSync(sp, dp);
  }
}

export async function buildSite(opts: { config: FrameworkConfig }) {
  const { config } = opts;

  const dist = resolveDistPath(config);
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  const routes = scanRoutes(config);
  log.info(`Building SSG: ${routes.length} routes`);

  for (const r of routes) {
    const url = new URL("http://localhost" + r.urlPath);

    const html = await renderRouteToHtml({
      config,
      route: r,
      url,
      params: {},
      query: {},
      headers: {},
      cookies: {}
    });

    const outPath =
      r.urlPath === "/"
        ? join(dist, "index.html")
        : join(dist, r.urlPath.slice(1), "index.html");

    mkdirSync(join(outPath, ".."), { recursive: true });
    writeFileSync(outPath, html, "utf8");

    log.info(`SSG: ${r.urlPath} -> ${outPath}`);
  }

  // Copy site assets into dist
  copyDir(join(process.cwd(), config.siteDir, "assets"), join(dist, "assets"));

  // Temporary CSS output placeholder
  writeFileSync(join(dist, "styles.css"), `/* TODO: compile SCSS -> CSS */\n`, "utf8");

  log.info("Build complete.");
}
