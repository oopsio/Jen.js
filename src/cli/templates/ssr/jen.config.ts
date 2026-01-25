import type { JenConfig } from "../../types";

const config: JenConfig = {
  name: "MySSRApp",
  mode: "ssr",
  plugins: ["example_plugin.lua"],
  buildDir: "dist",
  siteDir: "site",
  assetsDir: "assets",
  cssFramework: true,
};

export default config;
