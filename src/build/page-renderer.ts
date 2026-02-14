import { FrameworkConfig } from '../core/config.js';
import { RouteEntry } from '../core/routes/scan.js';
import { renderRouteToHtml } from '../runtime/render.js';
import { Minifier } from './minifier.js';

export interface PageRenderContext {
  config: FrameworkConfig;
  route: RouteEntry;
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

export class PageRenderer {
  /**
   * Render a route to a full HTML string, including minification if requested
   */
  static async render(ctx: PageRenderContext, minify = false): Promise<string> {
    // 1. Core Preact render
    let html = await renderRouteToHtml({
      config: ctx.config,
      route: ctx.route,
      req: {} as any,
      res: {} as any,
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
