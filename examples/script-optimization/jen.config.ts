/*
 * Example: Script Optimization
 * 
 * Demonstrates tree-shaking, code splitting, lazy-loading, auto-hashing, and cache-busting
 */

import type { FrameworkConfig } from "@src/core/config.js";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  features: {
    // Enable only needed features - others are tree-shaken
    api: true,
    middleware: true,
    cache: true,
    env: true,
    // Disabled = tree-shaken from bundle
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
      // Preload critical chunks
      `<link rel="preload" as="script" href="/runtime.js">`,
      `<link rel="prefetch" as="script" href="/dashboard.js">`,
      `<link rel="prefetch" as="script" href="/settings.js">`,
    ],
    bodyEnd: [
      // Lazy-loading runtime
      `<script type="module" src="/lazy-runtime.js"><\/script>`,
    ],
  },

  css: {
    globalScss: "site/styles/global.scss",
    criticalBudget: 4096,
    extractCritical: true,
  },

  assets: {
    publicDir: "site/assets",
    // Cache-busting strategy: long-term caching for hashed assets
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
    // Asset hashing enables cache-busting
    hashAssets: true,
    // Manifest allows SSR to reference hashed filenames
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
};

export default config;
