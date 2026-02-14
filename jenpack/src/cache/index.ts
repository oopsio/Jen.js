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

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

interface CacheEntry {
  hash: string;
  code: string;
  map?: string;
  timestamp: number;
}

export class BuildCache {
  private cacheDir: string;
  private cache: Map<string, CacheEntry> = new Map();
  private dirty: Set<string> = new Set();

  constructor(cacheDir: string = ".jenpack-cache") {
    this.cacheDir = cacheDir;
    this.loadCache();
  }

  private loadCache(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
      return;
    }

    try {
      const indexPath = join(this.cacheDir, "index.json");
      if (existsSync(indexPath)) {
        const data = JSON.parse(readFileSync(indexPath, "utf8"));
        for (const [key, value] of Object.entries(data)) {
          this.cache.set(key, value as CacheEntry);
        }
      }
    } catch (error) {
      // Ignore cache load errors
    }
  }

  get(filePath: string, fileHash: string): CacheEntry | null {
    const cached = this.cache.get(filePath);
    if (!cached) return null;

    // Cache is valid only if file hash matches
    if (cached.hash !== fileHash) {
      return null;
    }

    return cached;
  }

  set(filePath: string, entry: CacheEntry): void {
    this.cache.set(filePath, entry);
    this.dirty.add(filePath);
  }

  has(filePath: string, fileHash: string): boolean {
    const cached = this.cache.get(filePath);
    if (!cached) return false;
    return cached.hash === fileHash;
  }

  invalidate(filePath: string): void {
    this.cache.delete(filePath);
    this.dirty.add(filePath);
  }

  async save(): Promise<void> {
    if (this.dirty.size === 0) return;

    mkdirSync(this.cacheDir, { recursive: true });

    const data: Record<string, CacheEntry> = {};
    for (const [key, value] of this.cache.entries()) {
      data[key] = value;
    }

    writeFileSync(
      join(this.cacheDir, "index.json"),
      JSON.stringify(data, null, 2),
      "utf8",
    );
    this.dirty.clear();
  }

  clear(): void {
    this.cache.clear();
    if (existsSync(this.cacheDir)) {
      rmSync(this.cacheDir, { recursive: true, force: true });
    }
    mkdirSync(this.cacheDir, { recursive: true });
  }

  getStats(): { size: number; files: number } {
    return {
      size: this.cache.size,
      files: this.dirty.size,
    };
  }
}

export function computeFileHash(filePath: string, content: string): string {
  return createHash("sha256")
    .update(`${filePath}:${content}`)
    .digest("hex")
    .slice(0, 12);
}
