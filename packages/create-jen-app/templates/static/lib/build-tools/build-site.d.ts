export interface BuildOptions {
    minify?: boolean;
    sourcemap?: boolean;
    optimize?: boolean;
}
export declare function buildSite(opts?: BuildOptions): Promise<void>;
