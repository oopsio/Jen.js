// Native modules entry point
// Provides high-performance implementations
// Note: These are TypeScript stubs. In production, replace with native Rust/C++ bindings.
export { startDevServer } from "./dev-server.js";
export { bundle, bundleAssets } from "./bundle.js";
export { compileScss, compileCSS, watchStyles } from "./style-compiler.js";
export { optimize, optimizeImages, minifyHTML } from "./optimizer.js";
// Native module status
export const NATIVE_MODULES = {
  devServer: {
    name: "dev-server",
    status: "stub",
    implementation: "TypeScript",
  },
  bundler: {
    name: "bundler",
    status: "stub",
    implementation: "esbuild wrapper",
  },
  styleCompiler: {
    name: "style-compiler",
    status: "stub",
    implementation: "TypeScript",
  },
  optimizer: {
    name: "optimizer",
    status: "stub",
    implementation: "TypeScript",
  },
};
console.log(
  "[NATIVE MODULES] Loaded (TypeScript stubs - replace with native bindings in production)",
);
