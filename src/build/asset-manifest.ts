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
