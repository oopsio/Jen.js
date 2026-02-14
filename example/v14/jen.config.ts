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
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\(([^)]+)\)\.(tsx|jsx|ts|js)$/,
    enableIndexFallback: true,
  },
  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 0,
  },
  inject: {
    head: [],
    bodyEnd: [],
  },
  css: {
    globalScss: "site/styles/global.scss",
  },
  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=3600",
  },
  server: {
    port: 3002,
    hostname: "localhost",
  },
  dev: {
    liveReload: true,
  },
};

export default config;
