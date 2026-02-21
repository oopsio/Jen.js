import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
export declare function renderRouteToHtml(opts: {
    config: FrameworkConfig;
    route: RouteEntry;
    req?: any;
    res?: any;
    url: URL;
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
}): Promise<string>;
