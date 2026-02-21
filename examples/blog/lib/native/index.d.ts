export { startDevServer } from "./dev-server.js";
export type { DevServerOptions } from "./dev-server.js";
export { bundle, bundleAssets } from "./bundle.js";
export type { BundlerOptions } from "./bundle.js";
export { compileScss, compileCSS, watchStyles } from "./style-compiler.js";
export type { StyleCompilerOptions } from "./style-compiler.js";
export { optimize, optimizeImages, minifyHTML } from "./optimizer.js";
export type { OptimizerOptions } from "./optimizer.js";
export declare const NATIVE_MODULES: {
    devServer: {
        name: string;
        status: string;
        implementation: string;
    };
    bundler: {
        name: string;
        status: string;
        implementation: string;
    };
    styleCompiler: {
        name: string;
        status: string;
        implementation: string;
    };
    optimizer: {
        name: string;
        status: string;
        implementation: string;
    };
};
