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

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';

export class AssetHasher {
  /**
   * Calculate hash of file content
   */
  static hashContent(content: string | Buffer): string {
    return createHash('md5').update(content).digest('hex').slice(0, 10);
  }

  /**
   * Rename file to include hash (e.g. style.css -> style.a1b2c3.css)
   */
  static hashFile(filePath: string): string {
    const content = readFileSync(filePath);
    const hash = this.hashContent(content);
    
    const dir = dirname(filePath);
    const ext = extname(filePath);
    const name = basename(filePath, ext);
    
    const newName = `${name}.${hash}${ext}`;
    const newPath = join(dir, newName);
    
    renameSync(filePath, newPath);
    return newName;
  }
}
