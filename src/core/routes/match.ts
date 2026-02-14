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

import type { RouteEntry } from "./scan.js";

export type MatchResult = {
  route: RouteEntry;
  params: Record<string, string>;
};

export function matchRoute(
  routes: RouteEntry[],
  pathname: string,
): MatchResult | null {
  for (const r of routes) {
    const re = new RegExp(r.pattern);
    const m = pathname.match(re);
    if (!m) continue;

    const params: Record<string, string> = {};
    for (let i = 0; i < r.paramNames.length; i++) {
      params[r.paramNames[i]] = decodeURIComponent(m[i + 1] ?? "");
    }

    return { route: r, params };
  }
  return null;
}
