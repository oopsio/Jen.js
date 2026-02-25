/*
 * Blog example configuration for Jen.js
 * Features: SSR, dynamic routes for posts, markdown processing
 */

import type { FrameworkConfig } from "./lib/core/config.js";

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
    defaultRevalidateSeconds: 60,
  },

  inject: {
    head: [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      `<meta name="theme-color" content="#0f172a">`,
      `<meta name="description" content="A modern blog built with Jen.js">`,
      `<link rel="preconnect" href="https://fonts.googleapis.com">`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
      `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">`,
    ],
  },

  css: {
    globalScss: "site/styles/global.scss",
  },

  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=31536000, immutable",
  },

  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 0,
    hostname: "0.0.0.0",
  },
};

export default config;

