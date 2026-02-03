import type { FrameworkConfig } from "../../src/core/config.js";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssr",
    defaultRevalidateSeconds: 0,
  },

  inject: {
    head: [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width,initial-scale=1">`,
      `<meta name="theme-color" content="#2563eb">`,
    ],
    bodyEnd: [],
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
    port: 3000,
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
    port: 3000,
  },

  seo: {
    generateRobotsTxt: true,
    generateSitemap: true,
    sitemapBaseUrl: process.env.SITE_URL || "https://example.com",
  },
};

export default config;
