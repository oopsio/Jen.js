import { compile, compileString } from "../vendor/sass/sass.node.mjs";
import { globSync } from "../vendor/glob/glob.js";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { log } from "../shared/log.js";
export class ScssCompiler {
  compile(options) {
    const {
      inputPath,
      outputPath,
      minified = false,
      sourceMap = false,
    } = options;
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
        log.info(
          `[SCSS] ✓ ${relative(process.cwd(), inputPath)} → ${relative(process.cwd(), outputPath)}`,
        );
      }
      return {
        css: result.css,
        sourceMap: result.sourceMap
          ? JSON.stringify(result.sourceMap)
          : undefined,
      };
    } catch (err) {
      const message = err.message || String(err);
      log.error(`[SCSS] ✗ ${inputPath}: ${message}`);
      return { css: "", error: message };
    }
  }
  compileString(scss, options) {
    try {
      const result = compileString(scss, {
        style: options?.minified ? "compressed" : "expanded",
      });
      return { css: result.css };
    } catch (err) {
      const message = err.message || String(err);
      log.error(`[SCSS] ✗ Inline compilation error: ${message}`);
      return { css: "", error: message };
    }
  }
  compileGlob(pattern, outputDir, minified = false) {
    const files = globSync(pattern);
    let count = 0;
    files.forEach((file) => {
      const rel = relative(outputDir, file);
      const output = join(outputDir, rel.replace(/\.scss$/, ".css"));
      const result = this.compile({
        inputPath: file,
        outputPath: output,
        minified,
      });
      if (!result.error) count++;
    });
    return count;
  }
}
export function createScssCompiler() {
  return new ScssCompiler();
}
