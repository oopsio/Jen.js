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

import * as esbuild from 'esbuild';
import { log } from '../shared/log.js';

export interface MinifyOptions {
  minifyIdentifiers?: boolean;
  minifySyntax?: boolean;
  minifyWhitespace?: boolean;
  target?: string | string[];
}

export class Minifier {
  /**
   * Minify JavaScript/TypeScript using esbuild
   */
  static async minifyJs(code: string, options: MinifyOptions = {}): Promise<string> {
    try {
      const result = await esbuild.transform(code, {
        loader: 'js',
        minify: true,
        legalComments: 'none',
        ...options
      });
      return result.code;
    } catch (err) {
      log.error('Minification failed (JS)');
      throw err;
    }
  }

  /**
   * Minify CSS using esbuild
   */
  static async minifyCss(code: string): Promise<string> {
    try {
      const result = await esbuild.transform(code, {
        loader: 'css',
        minify: true
      });
      return result.code;
    } catch (err) {
      log.error('Minification failed (CSS)');
      throw err;
    }
  }

  /**
   * Minify HTML (basic regex/string-based, as esbuild doesn't handle HTML)
   */
  static minifyHtml(html: string): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/>\s+</g, '><')         // Remove whitespace between tags
      .replace(/\s{2,}/g, ' ')         // Collapse multiple whitespaces
      .trim();
  }
}
