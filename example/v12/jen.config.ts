import type { FrameworkConfig } from "../../src/core/types";

const config: any = {
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
    ],
    bodyEnd: [],
  },

  css: {
    globalScss: "site/styles/global.scss",
  },

  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=31536000, immutable",
  },

  server: {
    port: 3001,
    hostname: "0.0.0.0",
  },

  database: {
    type: "jdb",
    jdb: {
      root: "./data",
      inMemory: false,
    },
  },
};

export default config;
