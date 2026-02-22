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

import type { FrameworkConfig } from "../../src/core/config.js";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  routes: {
    fileExtensions: [".tsx", ".ts"],
    routeFilePattern: /^\(([^)]+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssr",
    defaultRevalidateSeconds: 3600,
  },

  inject: {
    head: [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>Jen.js SSR Example</title>",
      // --- Add Tailwind CDN ---
      '<script src="https://cdn.tailwindcss.com"></script>',
    ],
    bodyEnd: [],
  },

  css: {
    globalScss: "site/styles.scss",
  },

  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=31536000",
  },

  server: {
    port: 9999,
    hostname: "127.0.0.1",
  },

  build: {
    minifyHtml: true,
    minifyCss: true,
    minifyJs: true,
    sourceMap: false,
  },

  dev: {
    enableSSR: true,
    liveReload: true,
  },
};

export default config;
