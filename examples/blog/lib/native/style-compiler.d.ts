export interface StyleCompilerOptions {
  input: string;
  output?: string;
  minify?: boolean;
  sourcemap?: boolean;
  includePaths?: string[];
}
export declare function compileScss(
  opts: StyleCompilerOptions,
): Promise<string>;
export declare function compileCSS(
  input: string,
  minify?: boolean,
): Promise<string>;
export declare function watchStyles(
  input: string,
  output: string,
  onChange: (css: string) => void,
): Promise<void>;
