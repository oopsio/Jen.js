import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
export class AssetManifest {
    manifest = {};
    manifestPath;
    constructor(distDir) {
        this.manifestPath = join(distDir, "manifest.json");
        if (existsSync(this.manifestPath)) {
            this.manifest = JSON.parse(readFileSync(this.manifestPath, "utf8"));
        }
    }
    set(original, hashed) {
        this.manifest[original] = hashed;
    }
    get(original) {
        return this.manifest[original];
    }
    save() {
        writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));
    }
}
