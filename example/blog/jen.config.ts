import type { FrameworkConfig } from "../../src/core/config.ts";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true
  },

  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 3600  // Revalidate hourly
  },

  inject: {
    head: [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      `<meta name="theme-color" content="#0066cc">`,
    ],
    bodyEnd: [
      `<!-- Analytics placeholder -->`,
    ]
  },

  css: {
    globalScss: "site/styles/global.scss"
  },

  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=31536000, immutable"
  },

  server: {
    port: 3000,
    hostname: "0.0.0.0"
  }
};

export default config;
