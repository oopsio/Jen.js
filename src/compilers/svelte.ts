import { compile as svelteCompile } from "svelte/compiler";
import { log } from "../shared/log.js";

export interface SvelteCompileOptions {
  filename?: string;
  dev?: boolean;
  minified?: boolean;
  hydratable?: boolean;
}

export interface SvelteCompileResult {
  code: string;
  css?: { code: string; map?: any };
  error?: string;
}

export class SvelteCompiler {
  compile(source: string, options: SvelteCompileOptions): SvelteCompileResult {
    try {
      const filename = options.filename || "component.svelte";

      const result = svelteCompile(source, {
        filename,
        dev: options.dev ?? false,
        hydratable: options.hydratable ?? false,
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
        const escapedCss = result.css.code.replace(/"/g, '\\"').replace(/\n/g, "\\n");
        code += `
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = "${escapedCss}";
  document.head.appendChild(style);
}
`;
      }

      return { code };
    } catch (err: any) {
      const message = err.message || String(err);
      log.error(`[Svelte] Compilation error: ${message}`);
      return { code: "", error: message };
    }
  }
}

export function createSvelteCompiler(): SvelteCompiler {
  return new SvelteCompiler();
}
