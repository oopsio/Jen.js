import { createHash } from "node:crypto";
import { readFileSync, renameSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { hashWithRust } from "./rust-hashing.js";
export class AssetHasher {
    /**
     * Calculate hash of file content
     */
    static hashContent(content) {
        return createHash("md5").update(content).digest("hex").slice(0, 10);
    }
    /**
     * High-performance hashing for directories using Rust utility.
     * Useful during build for hashing all assets in bulk.
     */
    static async hashDirectory(dirPath) {
        try {
            const response = await hashWithRust({
                path: dirPath,
                algorithm: "sha256",
                hashFileNames: false,
            });
            const result = {};
            for (const h of response.hashes) {
                // Rust returns relative path, map it to hash
                result[h.path] = h.hash.slice(0, 10);
            }
            return result;
        }
        catch (err) {
            console.warn(`[AssetHasher] Rust hashing failed, falling back to Node.js: ${err}`);
            return {}; // Fallback would be implemented by caller or here
        }
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
