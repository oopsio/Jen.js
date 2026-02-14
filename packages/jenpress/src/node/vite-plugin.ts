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

import type { Plugin } from 'vite';
import { transformMarkdownFile } from './markdown/transform.js';
import { resolve } from 'path'

export interface JenPressPluginOptions {
  srcDir?: string;
  docsDir?: string;
  include?: string[];
  exclude?: string[];
}

export function createVitePressPlugin(options: JenPressPluginOptions = {}): Plugin {
  const { srcDir = process.cwd(), docsDir = 'docs' } = options;
  const docsAbsolute = resolve(srcDir, docsDir);

  return {
    name: 'vite-plugin-jenpress',
    resolveId(id) {
      if (id.endsWith('.md')) {
        return id;
      }
    },
    async load(id) {
      if (!id.endsWith('.md')) {
        return null;
      }

      try {
        return await transformMarkdownFile(id);
      } catch (error) {
        console.error(`Error transforming ${id}:`, error);
        throw error;
      }
    },
  };
}

export default createVitePressPlugin;
