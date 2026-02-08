import type { FrameworkConfig } from "../../src/core/config.ts";

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
      `<meta name="theme-color" content="#2563eb">`,
      `<meta name="description" content="Modern web application built with Jen.js">`,
      `<link rel="preconnect" href="https://fonts.googleapis.com">`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
      `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`,
    ],
    bodyEnd: [
      `<script>
        // Custom analytics placeholder
        window.__APP_VERSION__ = "1.0.0";
        // Add your tracking code here
      </script>`,
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
    port: 3000,
    hostname: "0.0.0.0",
  },
};

export default config;
