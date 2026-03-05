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

import type { FrameworkConfig } from "./src/core/config.js";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  /**
   * Feature Configuration
   * Control which framework features are enabled/disabled.
   * Disabled features are completely tree-shaken for zero overhead.
   *
   * For this example project, we enable commonly used features.
   * Adjust based on your actual usage to minimize bundle size.
   *
   * See FEATURE_GATING.md for complete feature list and examples.
   */
  features: {
    api: true, // Enable API routes
    middleware: true, // Enable middleware pipeline
    cache: true, // Enable response caching
    env: true, // Environment variables (enabled by default)
    // Disable features you don't use to reduce bundle size:
    markdown: false,
    imageOpt: false,
    streaming: false,
    auth: false,
    graphql: false,
    db: false,
    i18n: false,
    jdb: false,
  },

  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 0,
  },

  inject: {
    head: [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width,initial-scale=1">`,
      `<meta name="theme-color" content="#2563eb">`,
    ],
    bodyEnd: [
      // Polyfills for IE11+ and legacy browser support (Promise, fetch, Object.assign, etc)
      `<script src="/polyfills.js"></script>`,
      // Preact runtime bundle for client-side interactivity
      `<script type="module" src="/preact-runtime.js"></script>`,
    ],
  },

  css: {
    globalScss: "site/styles/global.scss",
    criticalBudget: 4096,
    extractCritical: true,
  },

  assets: {
    publicDir: "site/assets",
    cacheControl: "public,max-age=31536000,immutable",
    hashLength: 12,
  },

  server: {
    port: 5173,
    hostname: "0.0.0.0",
  },

  build: {
    minifyHtml: true,
    minifyCss: true,
    minifyJs: true,
    hashAssets: true,
    generateManifest: true,
    generateSitemap: true,
    cacheDir: ".jen",
    incrementalBuild: true,
    sourceMap: false,
  },

  dev: {
    enableSSR: true,
    liveReload: true,
    port: 5173,
  },

  seo: {
    generateRobotsTxt: true,
    generateSitemap: true,
    sitemapBaseUrl: process.env.SITE_URL || "https://example.com",
  },

  fonts: {
    // Uncomment to enable fonts
    // local: [
    //   "site/fonts/Inter-Regular.woff2",
    //   "site/fonts/Inter-Bold.woff2",
    // ],
    // google: ["Inter:400,700", "Roboto:400,600"],
    // preload: true,
    // display: "swap",
  },
};

export default config;
