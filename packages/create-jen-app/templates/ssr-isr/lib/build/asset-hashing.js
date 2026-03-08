import { createHash } from "node:crypto";
import { readFileSync, renameSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
export class AssetHasher {
    /**
     * Calculate hash of file content
     */
    static hashContent(content) {
        return createHash("md5").update(content).digest("hex").slice(0, 10);
    }
    /**
     * Rename file to include hash (e.g. style.css -> style.a1b2c3.css)
     */
    static hashFile(filePath) {
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
