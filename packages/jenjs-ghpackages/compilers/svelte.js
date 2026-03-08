import { compile as svelteCompile } from "svelte/compiler";
import { log } from "../shared/log.js";
export class SvelteCompiler {
  compile(source, options) {
    try {
      const filename = options.filename || "component.svelte";
      const result = svelteCompile(source, {
        filename,
        dev: options.dev ?? false,
        css: "injected", // Inject CSS at runtime instead of extracting
        preserveComments: !options.minified,
        preserveWhitespace: !options.minified,
      });
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((w) => {
          log.warn(`[Svelte] ${filename}: ${w.message}`);
        });
      }
      // Build module code
      let code = result.js.code;
      // If CSS is generated, inject it
      if (result.css && result.css.code.trim()) {
        const escapedCss = result.css.code
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n");
        code += `
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = "${escapedCss}";
  document.head.appendChild(style);
}
`;
      }
      return { code };
    } catch (err) {
      const message = err.message || String(err);
      log.error(`[Svelte] Compilation error: ${message}`);
      return { code: "", error: message };
    }
  }
}
export function createSvelteCompiler() {
  return new SvelteCompiler();
}
