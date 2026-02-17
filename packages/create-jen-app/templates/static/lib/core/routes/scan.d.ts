import type { FrameworkConfig } from "../config.js";
export type RouteEntry = {
    id: string;
    filePath: string;
    urlPath: string;
    pattern: string;
    paramNames: string[];
};
export declare function scanRoutes(config: FrameworkConfig): RouteEntry[];
