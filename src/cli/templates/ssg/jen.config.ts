import type { JenConfig } from "../../types";

const config: JenConfig = {
  name: "MySSGApp",
  mode: "ssg",           // "ssg" | "ssr" | "ppr"
  plugins: ["example_plugin.lua"],
  buildDir: "dist",
  siteDir: "site",
  assetsDir: "assets",
  cssFramework: true,
};

export default config;
