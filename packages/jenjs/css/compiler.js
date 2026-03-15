import { compile, compileString } from "sass";
import { globSync } from "../vendor/glob/glob.js";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { log } from "../shared/log.js";
/**
 * SCSS/SASS compiler with file writing support.
 * Compiles SCSS to CSS with optional minification and source maps.
 */
export class ScssCompiler {
    /**
     * Compile a single SCSS file.
     *
     * @param options Compilation options.
     * @returns Compiled CSS and optional source map.
     */
    compile(options) {
        const { inputPath, outputPath, minified = false, sourceMap = false, } = options;
        try {
            if (!existsSync(inputPath)) {
                const error = `File not found: ${inputPath}`;
                log.error(`[SCSS]  ${error}`);
                return { css: "", error };
            }
            log.info(`[SCSS] Compiling: ${relative(process.cwd(), inputPath)}${minified ? " (minified)" : ""}${sourceMap ? " (source map)" : ""}`);
            const result = compile(inputPath, {
                style: minified ? "compressed" : "expanded",
                sourceMap,
            });
            if (outputPath) {
                mkdirSync(dirname(outputPath), { recursive: true });
                writeFileSync(outputPath, result.css);
                if (result.sourceMap && sourceMap) {
                    writeFileSync(outputPath + ".map", JSON.stringify(result.sourceMap));
                    log.info(`[SCSS] Source map: ${outputPath}.map`);
                }
                log.info(`[SCSS]  ${relative(process.cwd(), inputPath)} → ${relative(process.cwd(), outputPath)}`);
            }
            return {
                css: result.css,
                sourceMap: result.sourceMap
                    ? JSON.stringify(result.sourceMap)
                    : undefined,
            };
        }
        catch (err) {
            const message = err.message || String(err);
            log.error(`[SCSS]  ${inputPath}: ${message}`);
            return { css: "", error: message };
        }
    }
    /**
     * Compile SCSS string without file output.
     *
     * @param scss SCSS content as string.
     * @param options Compilation options.
     * @returns Compiled CSS.
     */
    compileString(scss, options) {
        try {
            log.info(`[SCSS] Compiling inline SCSS${options?.minified ? " (minified)" : ""}`);
            const result = compileString(scss, {
                style: options?.minified ? "compressed" : "expanded",
            });
            return { css: result.css };
        }
        catch (err) {
            const message = err.message || String(err);
            log.error(`[SCSS]  Inline compilation error: ${message}`);
            return { css: "", error: message };
        }
    }
    /**
     * Compile all SCSS files matching a glob pattern.
     *
     * @param pattern Glob pattern to match files.
     * @param outputDir Output directory for compiled CSS.
     * @param minified Whether to minify output CSS.
     * @returns Number of files successfully compiled.
     */
    compileGlob(pattern, outputDir, minified = false) {
        try {
            log.info(`[SCSS] Compiling glob: ${pattern}`);
            const files = globSync(pattern);
            log.info(`[SCSS] Found ${files.length} file(s) matching pattern`);
            let count = 0;
            files.forEach((file) => {
                const rel = relative(outputDir, file);
                const output = join(outputDir, rel.replace(/\.scss$/, ".css"));
                const result = this.compile({
                    inputPath: file,
                    outputPath: output,
                    minified,
                });
                if (!result.error)
                    count++;
            });
            log.info(`[SCSS] Successfully compiled ${count}/${files.length} files`);
            return count;
        }
        catch (err) {
            log.error(`[SCSS]  Glob compilation failed: ${err instanceof Error ? err.message : String(err)}`);
            return 0;
        }
    }
}
export function createScssCompiler() {
    return new ScssCompiler();
}
