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
