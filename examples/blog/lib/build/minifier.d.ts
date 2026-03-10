export interface MinifyOptions {
  minifyIdentifiers?: boolean;
  minifySyntax?: boolean;
  minifyWhitespace?: boolean;
  target?: string | string[];
}
export declare class Minifier {
  /**
   * Minify JavaScript/TypeScript using esbuild
   */
  static minifyJs(code: string, options?: MinifyOptions): Promise<string>;
  /**
   * Minify CSS using esbuild
   */
  static minifyCss(code: string): Promise<string>;
  /**
   * Minify HTML (basic regex/string-based, as esbuild doesn't handle HTML)
   */
  static minifyHtml(html: string): string;
}
