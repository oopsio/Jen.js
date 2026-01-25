import type { RouteEntry } from "./scan.js";

export type MatchResult = {
  route: RouteEntry;
  params: Record<string, string>;
};

export function matchRoute(routes: RouteEntry[], pathname: string): MatchResult | null {
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
