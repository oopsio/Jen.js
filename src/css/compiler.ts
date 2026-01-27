import { compile, compileString } from "sass";
import { globSync } from "glob";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, extname, relative } from "node:path";
import { log } from "../shared/log.js";

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

export class ScssCompiler {
  compile(options: CompileOptions): CompileResult {
    const { inputPath, outputPath, minified = false, sourceMap = false } = options;

    try {
      if (!existsSync(inputPath)) {
        return { css: "", error: `File not found: ${inputPath}` };
      }

      const result = compile(inputPath, {
        style: minified ? "compressed" : "expanded",
        sourceMap,
      });

      if (outputPath) {
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, result.css);

        if (result.sourceMap && sourceMap) {
          writeFileSync(outputPath + ".map", JSON.stringify(result.sourceMap));
        }

        log.info(`[SCSS] ✓ ${relative(process.cwd(), inputPath)} → ${relative(process.cwd(), outputPath)}`);
      }

      return {
        css: result.css,
        sourceMap: result.sourceMap ? JSON.stringify(result.sourceMap) : undefined,
      };
    } catch (err: any) {
      const message = err.message || String(err);
      log.error(`[SCSS] ✗ ${inputPath}: ${message}`);
      return { css: "", error: message };
    }
  }

  compileString(scss: string, options?: { minified?: boolean }): CompileResult {
    try {
      const result = compileString(scss, {
        style: options?.minified ? "compressed" : "expanded",
      });

      return { css: result.css };
    } catch (err: any) {
      const message = err.message || String(err);
      log.error(`[SCSS] ✗ Inline compilation error: ${message}`);
      return { css: "", error: message };
    }
  }

  compileGlob(pattern: string, outputDir: string, minified: boolean = false): number {
    const files = globSync(pattern);

    let count = 0;
    files.forEach((file: string) => {
      const rel = relative(outputDir, file);
      const output = join(outputDir, rel.replace(/\.scss$/, ".css"));
      const result = this.compile({ inputPath: file, outputPath: output, minified });

      if (!result.error) count++;
    });

    return count;
  }
}

export function createScssCompiler(): ScssCompiler {
  return new ScssCompiler();
}
