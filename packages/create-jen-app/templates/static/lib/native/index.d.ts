/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
