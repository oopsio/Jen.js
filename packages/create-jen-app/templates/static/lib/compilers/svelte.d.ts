export interface SvelteCompileOptions {
    filename?: string;
    dev?: boolean;
    minified?: boolean;
    hydratable?: boolean;
}
export interface SvelteCompileResult {
    code: string;
    css?: {
        code: string;
        map?: any;
    };
    error?: string;
}
export declare class SvelteCompiler {
    compile(source: string, options: SvelteCompileOptions): SvelteCompileResult;
}
export declare function createSvelteCompiler(): SvelteCompiler;
