import type { FrameworkConfig } from "../../src/core/config.js";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  routes: {
    fileExtensions: [".tsx", ".ts", ".vue", ".svelte"],
    routeFilePattern: /\(/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 3600,
  },

  inject: {
    head: [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<title>jen.js v17 - Vue + Svelte Demo</title>',
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
    port: 3000,
    hostname: "localhost",
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
