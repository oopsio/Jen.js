export interface Manifest {
    [key: string]: string;
}
export declare class AssetManifest {
    private manifest;
    private manifestPath;
    constructor(distDir: string);
    set(original: string, hashed: string): void;
    get(original: string): string | undefined;
    save(): void;
}
