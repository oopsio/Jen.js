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
