import { transform, transformSync, parse } from "@swc/core";
import type { TransformOptions } from "../types.js";
import { isTypeScriptFile } from "../utils/path.js";

export interface SwcTransformResult {
  code: string;
  map?: string;
}

export async function transformFile(
  source: string,
  options: TransformOptions,
): Promise<SwcTransformResult> {
  const isTS = isTypeScriptFile(options.filename);
  const isJSX =
    options.filename.endsWith(".jsx") || options.filename.endsWith(".tsx");

  const swcOptions = {
    filename: options.filename,
    sourceMaps: options.sourcemap ? "inline" : false,
    minify: options.minify,
    jsc: {
      parser: {
        syntax: isTS ? "typescript" : "ecmascript",
        typescript: isTS ? { tsx: isJSX, decorators: true } : undefined,
        jsx: !isTS && isJSX,
      },
      transform: {
        react: isJSX
          ? {
              runtime: "automatic",
              importSource: options.jsxImportSource,
            }
          : undefined,
      },
      minify: options.minify
        ? {
            compress: true,
            mangle: true,
          }
        : undefined,
      target: "es2022" as const,
    },
    isModule: options.isModule,
    env: {
      targets: {
        chrome: "90",
        firefox: "88",
        safari: "15",
      },
    },
  };

  try {
    const result = await transform(source, swcOptions as any);
    return {
      code: result.code,
      map: result.map,
    };
  } catch (error) {
    const err = error as any;
    throw new Error(`Failed to transform ${options.filename}: ${err.message}`);
  }
}

export function transformFileSync(
  source: string,
  options: TransformOptions,
): SwcTransformResult {
  const isTS = isTypeScriptFile(options.filename);
  const isJSX =
    options.filename.endsWith(".jsx") || options.filename.endsWith(".tsx");

  const swcOptions = {
    filename: options.filename,
    sourceMaps: options.sourcemap ? "inline" : false,
    minify: options.minify,
    jsc: {
      parser: {
        syntax: isTS ? "typescript" : "ecmascript",
        typescript: isTS ? { tsx: isJSX, decorators: true } : undefined,
        jsx: !isTS && isJSX,
      },
      transform: {
        react: isJSX
          ? {
              runtime: "automatic",
              importSource: options.jsxImportSource,
            }
          : undefined,
      },
      minify: options.minify
        ? {
            compress: true,
            mangle: true,
          }
        : undefined,
      target: "es2022" as const,
    },
    isModule: options.isModule,
    env: {
      targets: {
        chrome: "90",
        firefox: "88",
        safari: "15",
      },
    },
  };

  try {
    const result = transformSync(source, swcOptions as any);
    return {
      code: result.code,
      map: result.map,
    };
  } catch (error) {
    const err = error as any;
    throw new Error(`Failed to transform ${options.filename}: ${err.message}`);
  }
}

export async function parseFile(
  source: string,
  filename: string,
): Promise<any> {
  const isTS = isTypeScriptFile(filename);
  const isJSX = filename.endsWith(".jsx") || filename.endsWith(".tsx");

  try {
    const ast = await parse(source, {
      syntax: isTS ? "typescript" : "ecmascript",
      typescript: isTS ? { tsx: isJSX, decorators: true } : undefined,
      jsx: !isTS && isJSX,
    });
    return ast;
  } catch (error) {
    const err = error as any;
    throw new Error(`Failed to parse ${filename}: ${err.message}`);
  }
}

export function extractImports(
  ast: any,
): Array<{ source: string; name?: string; type: "import" | "export" }> {
  const imports: Array<{
    source: string;
    name?: string;
    type: "import" | "export";
  }> = [];

  function visit(node: any) {
    if (!node || typeof node !== "object") return;

    if (node.type === "ImportDeclaration") {
      imports.push({
        source: node.source.value,
        type: "import",
      });
    } else if (
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportAllDeclaration"
    ) {
      if (node.source) {
        imports.push({
          source: node.source.value,
          type: "export",
        });
      }
    }

    for (const key in node) {
      if (key.startsWith("_")) continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          visit(item);
        }
      } else {
        visit(value);
      }
    }
  }

  visit(ast);
  return imports;
}
