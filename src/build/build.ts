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
import esbuild from "esbuild";
import { createScssCompiler } from "../css/compiler.js";
import { vueEsbuildPlugin, svelteEsbuildPlugin } from "../compilers/esbuild-plugins.js";

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
      req: {} as any,
      res: {} as any,
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

  // Handle Vue/Svelte components in site folder
  const siteSourceDir = join(process.cwd(), config.siteDir);
  const vueFiles = readdirSync(siteSourceDir, { recursive: true }).filter(
    (f) => String(f).endsWith(".vue") || String(f).endsWith(".svelte"),
  );

  if (vueFiles.length > 0) {
    log.info(`Found ${vueFiles.length} Vue/Svelte components, bundling...`);
    try {
      await esbuild.build({
        entryPoints: vueFiles.map((f) => join(siteSourceDir, String(f))),
        outdir: join(dist, "components"),
        format: "esm",
        target: "es2022",
        bundle: false,
        plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
        external: ["preact", "vue", "svelte"],
        logLevel: "info",
      });
      log.info("Vue/Svelte components bundled successfully.");
    } catch (err: any) {
      log.warn(`Failed to bundle Vue/Svelte components: ${err.message}`);
    }
  }

  // styles.css
  const scssPath = join(process.cwd(), config.css.globalScss);
  if (existsSync(scssPath)) {
    const compiler = createScssCompiler();
    const result = compiler.compile({
      inputPath: scssPath,
      minified: true
    });
    
    if (result.error) {
      log.error(`SCSS Compilation Failed: ${result.error}`);
      writeFileSync(join(dist, "styles.css"), "/* SCSS Compilation Failed */");
    } else {
      writeFileSync(join(dist, "styles.css"), result.css);
      log.info(`Compiled global SCSS: ${config.css.globalScss}`);
    }
  } else {
    log.warn(`Global SCSS file not found: ${scssPath}`);
    writeFileSync(join(dist, "styles.css"), "/* No global SCSS found */");
  }

  log.info("Build complete.");
}
