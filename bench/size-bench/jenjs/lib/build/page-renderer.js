import { renderRouteToHtml } from '../runtime/render.js';
import { Minifier } from './minifier.js';
export class PageRenderer {
    /**
     * Render a route to a full HTML string, including minification if requested
     */
    static async render(ctx, minify = false) {
        // 1. Core Preact render
        let html = await renderRouteToHtml({
            config: ctx.config,
            route: ctx.route,
            req: {},
            res: {},
            url: ctx.url,
            params: ctx.params,
            query: ctx.query,
            headers: ctx.headers,
            cookies: ctx.cookies
        });
        // 2. Post-processing (Layout injection, hydration script injection)
        // Note: Hydration logic is handled by island-hydration.ts usually
        // 3. Optional Minification
        if (minify) {
            html = Minifier.minifyHtml(html);
        }
        return html;
    }
}
