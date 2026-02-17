import { FrameworkConfig } from '../core/config.js';
import { RouteEntry } from '../core/routes/scan.js';
export interface PageRenderContext {
    config: FrameworkConfig;
    route: RouteEntry;
    url: URL;
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
}
export declare class PageRenderer {
    /**
     * Render a route to a full HTML string, including minification if requested
     */
    static render(ctx: PageRenderContext, minify?: boolean): Promise<string>;
}
