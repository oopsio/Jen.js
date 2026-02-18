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

export interface OptimizerOptions {
  files: string[];
  minify?: boolean;
  compress?: boolean;
  imageOptimization?: boolean;
}
export declare function optimize(opts: OptimizerOptions): Promise<{
  originalSize: number;
  optimizedSize: number;
  savings: number;
  files: string[];
}>;
export declare function optimizeImages(
  inputDir: string,
  outputDir: string,
  options?: {
    format?: "webp" | "avif";
    quality?: number;
  },
): Promise<void>;
export declare function minifyHTML(html: string): Promise<string>;
