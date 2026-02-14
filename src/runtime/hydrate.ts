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

import { hydrate } from "preact";
import { h } from "preact";
import { getFrameworkData } from "./client-runtime.js";

export async function hydrateClient(entryPath: string) {
  try {
    const data = getFrameworkData();
    const mod = await import(entryPath);

    if (!mod.default) {
      console.error(`Failed to hydrate: route module does not export default component`);
      return;
    }

    const Page = mod.default;
    const app = h(Page, {
      data: data?.data ?? null,
      params: data?.params ?? {},
      query: data?.query ?? {},
    });

    const root = document.getElementById("app");
    if (!root) {
      console.error("Failed to hydrate: #app element not found in DOM");
      return;
    }

    hydrate(app, root);
  } catch (err) {
    console.error("Hydration failed:", err instanceof Error ? err.message : String(err));
  }
}
