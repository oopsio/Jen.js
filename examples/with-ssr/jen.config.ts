import type { FrameworkConfig } from "../../src/core/config.js";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  routes: {
    fileExtensions: [".tsx", ".ts"],
    routeFilePattern: /^\(([^)]+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssr",
    defaultRevalidateSeconds: 3600,
  },

  inject: {
    head: [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>Jen.js SSR Example</title>",
      // --- Add Tailwind CDN ---
      '<script src="https://cdn.tailwindcss.com"></script>',
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
    port: 0, // 0 = OS auto-selects first available port
    hostname: "127.0.0.1",
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
