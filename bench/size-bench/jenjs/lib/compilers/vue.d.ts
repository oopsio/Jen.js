export interface VueCompileOptions {
  id?: string;
  filename?: string;
  minified?: boolean;
  sourceMap?: boolean;
}
export interface VueCompileResult {
  code: string;
  bindings?: Record<string, any>;
  error?: string;
}
export declare class VueCompiler {
  compile(source: string, options: VueCompileOptions): VueCompileResult;
}
export declare function createVueCompiler(): VueCompiler;
