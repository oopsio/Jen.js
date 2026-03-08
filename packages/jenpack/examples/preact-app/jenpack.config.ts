import { defineConfig } from "@jen/jenpack";

export default defineConfig({
  entry: "src/index.tsx",
  outDir: "dist",
  publicDir: "public",
  jsxImportSource: "preact",
  minify: true,
  sourcemap: true,
  define: {
    __DEV__: 'process.env.NODE_ENV === "development"',
  },
  alias: {
    "@": "./src",
  },
});
