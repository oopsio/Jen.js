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

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { hashWithRust } from "./rust-hashing.js";

export class AssetHasher {
  /**
   * Calculate hash of file content
   */
  static hashContent(content: string | Buffer): string {
    return createHash("md5").update(content).digest("hex").slice(0, 10);
  }

  /**
   * High-performance hashing for directories using Rust utility.
   * Useful during build for hashing all assets in bulk.
   */
  static async hashDirectory(dirPath: string): Promise<Record<string, string>> {
    try {
      const response = await hashWithRust({
        path: dirPath,
        algorithm: "sha256",
        hashFileNames: false,
      });

      const result: Record<string, string> = {};
      for (const h of response.hashes) {
        // Rust returns relative path, map it to hash
        result[h.path] = h.hash.slice(0, 10);
      }
      return result;
    } catch (err) {
      console.warn(`[AssetHasher] Rust hashing failed, falling back to Node.js: ${err}`);
      return {}; // Fallback would be implemented by caller or here
    }
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
