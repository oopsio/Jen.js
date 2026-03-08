const config = {
  siteDir: "site",
  distDir: "dist",
  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
  },
  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 60,
  },
  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=31536000, immutable",
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
  server: {
    port: 3000,
    hostname: "0.0.0.0",
  },
};
export default config;
