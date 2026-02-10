import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import type { SFCDescriptor } from "@vue/compiler-sfc";
import { log } from "../shared/log.js";

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

export class VueCompiler {
  compile(source: string, options: VueCompileOptions): VueCompileResult {
    try {
      const filename = options.filename || "component.vue";
      const id = options.id || filename.replace(/[^a-z0-9]/gi, "_");

      // Parse SFC
      const parseResult = parse(source, { filename });
      const descriptor = parseResult.descriptor as SFCDescriptor;

      let scriptCode = "";
      let templateCode = "";
      let styleCode = "";

      // Compile script
      if (descriptor.script || descriptor.scriptSetup) {
        const scriptCompiled = compileScript(descriptor, {
          id,
          isProd: options.minified ?? false,
        });
        scriptCode = scriptCompiled.content;
      }

      // Compile template
      if (descriptor.template) {
        const templateCompiled = compileTemplate({
          source: descriptor.template.content,
          filename,
          id,
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith("custom-"),
          },
        });

        if (templateCompiled.errors.length > 0) {
          return {
            code: "",
            error: `Template compilation error: ${templateCompiled.errors.join(", ")}`,
          };
        }

        templateCode = templateCompiled.code;
      }

      // Compile styles (scoped)
      if (descriptor.styles.length > 0) {
        descriptor.styles.forEach((style, idx) => {
          const styleCompiled = compileStyle({
            source: style.content,
            filename,
            id,
            scoped: style.scoped ?? false,
          });

          if (styleCompiled.errors.length > 0) {
            log.warn(
              `Style compilation warning at style[${idx}]: ${styleCompiled.errors.join(", ")}`,
            );
          }

          styleCode += styleCompiled.code + "\n";
        });
      }

      // Inject styles at runtime
      let injectStyle = "";
      if (styleCode.trim()) {
        const escapedStyle = styleCode.replace(/"/g, '\\"').replace(/\n/g, "\\n");
        injectStyle = `
const style = document.createElement('style');
style.textContent = "${escapedStyle}";
document.head.appendChild(style);
`;
      }

      // Build final module
      const finalCode = `
${scriptCode || "export default {}"}
${templateCode}
${injectStyle}
`;

      return { code: finalCode };
    } catch (err: any) {
      const message = err.message || String(err);
      log.error(`[Vue] Compilation error: ${message}`);
      return { code: "", error: message };
    }
  }
}

export function createVueCompiler(): VueCompiler {
  return new VueCompiler();
}
