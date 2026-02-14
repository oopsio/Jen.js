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

import type { Plugin as ESBuildPlugin } from "esbuild";
import { readFileSync } from "node:fs";
import { createVueCompiler } from "./vue.js";
import { createSvelteCompiler } from "./svelte.js";
import { log } from "../shared/log.js";

const vueCache = new Map<string, string>();
const svelteCache = new Map<string, string>();

export function vueEsbuildPlugin(): ESBuildPlugin {
  const compiler = createVueCompiler();

  return {
    name: "vue",
    setup(build) {
      build.onLoad({ filter: /\.vue$/ }, async (args) => {
        try {
          // Check cache
          if (vueCache.has(args.path)) {
            return {
              contents: vueCache.get(args.path)!,
              loader: "js",
            };
          }

          const source = readFileSync(args.path, "utf-8");
          const result = compiler.compile(source, {
            filename: args.path,
            id: args.path.replace(/[^a-z0-9]/gi, "_"),
          });

          if (result.error) {
            return {
              errors: [
                {
                  text: `Vue compilation failed: ${result.error}`,
                  location: { file: args.path, line: 1, column: 0 },
                },
              ],
            };
          }

          vueCache.set(args.path, result.code);

          return {
            contents: result.code,
            loader: "js",
          };
        } catch (err: any) {
          return {
            errors: [
              {
                text: `Vue plugin error: ${String(err)}`,
                location: { file: args.path, line: 1, column: 0 },
              },
            ],
          };
        }
      });
    },
  };
}

export function svelteEsbuildPlugin(): ESBuildPlugin {
  const compiler = createSvelteCompiler();

  return {
    name: "svelte",
    setup(build) {
      build.onLoad({ filter: /\.svelte$/ }, async (args) => {
        try {
          // Check cache
          if (svelteCache.has(args.path)) {
            return {
              contents: svelteCache.get(args.path)!,
              loader: "js",
            };
          }

          const source = readFileSync(args.path, "utf-8");
          const result = compiler.compile(source, {
            filename: args.path,
            dev: process.env.NODE_ENV !== "production",
          });

          if (result.error) {
            return {
              errors: [
                {
                  text: `Svelte compilation failed: ${result.error}`,
                  location: { file: args.path, line: 1, column: 0 },
                },
              ],
            };
          }

          svelteCache.set(args.path, result.code);

          return {
            contents: result.code,
            loader: "js",
          };
        } catch (err: any) {
          return {
            errors: [
              {
                text: `Svelte plugin error: ${String(err)}`,
                location: { file: args.path, line: 1, column: 0 },
              },
            ],
          };
        }
      });
    },
  };
}

export function invalidateVueCache(filePath: string) {
  vueCache.delete(filePath);
}

export function invalidateSvelteCache(filePath: string) {
  svelteCache.delete(filePath);
}

export function clearAllCompilerCaches() {
  vueCache.clear();
  svelteCache.clear();
}
