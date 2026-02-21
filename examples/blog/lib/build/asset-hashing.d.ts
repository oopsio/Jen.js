export declare class AssetHasher {
    /**
     * Calculate hash of file content
     */
    static hashContent(content: string | Buffer): string;
    /**
     * Rename file to include hash (e.g. style.css -> style.a1b2c3.css)
     */
    static hashFile(filePath: string): string;
}
