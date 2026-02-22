import esbuild from "esbuild";
export interface BundlerOptions {
  entryPoint: string;
  outdir?: string;
  format?: "esm" | "cjs" | "iife";
  minify?: boolean;
  sourcemap?: boolean;
}
export declare function bundle(opts: BundlerOptions): Promise<
  esbuild.BuildResult<{
    entryPoints: string[];
    outdir: string;
    format: "esm" | "iife" | "cjs";
    minify: boolean;
    sourcemap: boolean;
    platform: "browser";
    target: string;
    logLevel: "info";
  }>
>;
export declare function bundleAssets(
  assetsDir: string,
  outdir: string,
): Promise<void>;
