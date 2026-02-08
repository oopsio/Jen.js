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
