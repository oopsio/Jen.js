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

export interface MinifyOptions {
  minifyIdentifiers?: boolean;
  minifySyntax?: boolean;
  minifyWhitespace?: boolean;
  target?: string | string[];
}
export declare class Minifier {
  /**
   * Minify JavaScript/TypeScript using esbuild
   */
  static minifyJs(code: string, options?: MinifyOptions): Promise<string>;
  /**
   * Minify CSS using esbuild
   */
  static minifyCss(code: string): Promise<string>;
  /**
   * Minify HTML (basic regex/string-based, as esbuild doesn't handle HTML)
   */
  static minifyHtml(html: string): string;
}
