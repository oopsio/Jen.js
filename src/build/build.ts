import {
  mkdirSync,
  rmSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  readdirSync,
  statSync,
  readFileSync
} from "node:fs";
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

function compileScssFallback(scssPath: string) {
  // No sass dependency allowed here (you said SCSS framework built-in later)
  // so we do minimal: output raw scss as css comment + keep empty css.
  if (!existsSync(scssPath)) return "/* no global scss */\n";
  const raw = readFileSync(scssPath, "utf8");
  return `/* SCSS placeholder (compile later in Rust) */\n/*\n${raw}\n*/\n`;
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

  copyDir(join(process.cwd(), config.siteDir, "assets"), join(dist, "assets"));

  // styles.css
  const cssOut = compileScssFallback(join(process.cwd(), config.css.globalScss));
  writeFileSync(join(dist, "styles.css"), cssOut, "utf8");

  log.info("Build complete.");
}
