export interface OptimizerOptions {
  files: string[];
  minify?: boolean;
  compress?: boolean;
  imageOptimization?: boolean;
}
export declare function optimize(opts: OptimizerOptions): Promise<{
  originalSize: number;
  optimizedSize: number;
  savings: number;
  files: string[];
}>;
export declare function optimizeImages(
  inputDir: string,
  outputDir: string,
  options?: {
    format?: "webp" | "avif";
    quality?: number;
  },
): Promise<void>;
export declare function minifyHTML(html: string): Promise<string>;
