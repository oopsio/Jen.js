import type { RouteEntry } from "./scan.js";
export type MatchResult = {
    route: RouteEntry;
    params: Record<string, string>;
};
export declare function matchRoute(routes: RouteEntry[], pathname: string): MatchResult | null;
