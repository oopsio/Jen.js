/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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

  compileGlob(
    pattern: string,
    outputDir: string,
    minified: boolean = false,
  ): number {
    const files = globSync(pattern);

    let count = 0;
    files.forEach((file: string) => {
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

export function createScssCompiler(): ScssCompiler {
  return new ScssCompiler();
}
