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

import esbuild from "esbuild";
export interface BundlerOptions {
  entryPoint: string;
  outdir?: string;
  format?: "esm" | "cjs" | "iife";
  minify?: boolean;
  sourcemap?: boolean;
}
export declare function bundle(opts: BundlerOptions): Promise<
  esbuild.BuildResult<{
    entryPoints: string[];
    outdir: string;
    format: "esm" | "iife" | "cjs";
    minify: boolean;
    sourcemap: boolean;
    platform: "browser";
    target: string;
    logLevel: "info";
  }>
>;
export declare function bundleAssets(
  assetsDir: string,
  outdir: string,
): Promise<void>;
