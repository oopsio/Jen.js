import type { Plugin as ESBuildPlugin } from "esbuild";
export declare function vueEsbuildPlugin(): ESBuildPlugin;
export declare function svelteEsbuildPlugin(): ESBuildPlugin;
export declare function invalidateVueCache(filePath: string): void;
export declare function invalidateSvelteCache(filePath: string): void;
export declare function clearAllCompilerCaches(): void;
