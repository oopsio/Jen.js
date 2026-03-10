import * as esbuild from "esbuild";
import { log } from "../shared/log.js";
export class Minifier {
  /**
   * Minify JavaScript/TypeScript using esbuild
   */
  static async minifyJs(code, options = {}) {
    try {
      const result = await esbuild.transform(code, {
        loader: "js",
        minify: true,
        legalComments: "none",
        ...options,
      });
      return result.code;
    } catch (err) {
      log.error("Minification failed (JS)");
      throw err;
    }
  }
  /**
   * Minify CSS using esbuild
   */
  static async minifyCss(code) {
    try {
      const result = await esbuild.transform(code, {
        loader: "css",
        minify: true,
      });
      return result.code;
    } catch (err) {
      log.error("Minification failed (CSS)");
      throw err;
    }
  }
  /**
   * Minify HTML (basic regex/string-based, as esbuild doesn't handle HTML)
   */
  static minifyHtml(html) {
    return html
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/>\s+</g, "><") // Remove whitespace between tags
      .replace(/\s{2,}/g, " ") // Collapse multiple whitespaces
      .trim();
  }
}
