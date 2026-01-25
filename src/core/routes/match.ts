import type { RouteEntry } from "./scan.js";

export type MatchResult = {
  route: RouteEntry;
  params: Record<string, string>;
};

export function matchRoute(routes: RouteEntry[], pathname: string): MatchResult | null {
  // exact match first
  for (const r of routes) {
    if (r.urlPath === pathname) return { route: r, params: {} };
  }

  // dynamic match: /user/:id style via (id).tsx later
  // for now minimal, extend later

  return null;
}
