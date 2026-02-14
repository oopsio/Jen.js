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

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface Manifest {
  [key: string]: string;
}

export class AssetManifest {
  private manifest: Manifest = {};
  private manifestPath: string;

  constructor(distDir: string) {
    this.manifestPath = join(distDir, 'manifest.json');
    if (existsSync(this.manifestPath)) {
      this.manifest = JSON.parse(readFileSync(this.manifestPath, 'utf8'));
    }
  }

  set(original: string, hashed: string) {
    this.manifest[original] = hashed;
  }

  get(original: string): string | undefined {
    return this.manifest[original];
  }

  save() {
    writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));
  }
}
