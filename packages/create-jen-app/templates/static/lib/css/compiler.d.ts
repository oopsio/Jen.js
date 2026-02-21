export interface CompileOptions {
    inputPath: string;
    outputPath?: string;
    minified?: boolean;
    sourceMap?: boolean;
    watch?: boolean;
}
export interface CompileResult {
    css: string;
    sourceMap?: string;
    error?: string;
}
export declare class ScssCompiler {
    compile(options: CompileOptions): CompileResult;
    compileString(scss: string, options?: {
        minified?: boolean;
    }): CompileResult;
    compileGlob(pattern: string, outputDir: string, minified?: boolean): number;
}
export declare function createScssCompiler(): ScssCompiler;
