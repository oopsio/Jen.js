import type { IncomingMessage, ServerResponse } from "node:http";
import type { FrameworkConfig } from "../core/config.js";
/**
 * Server mode determines rendering strategy and asset serving behavior.
 * - "dev": Development mode with HMR, live SCSS compilation, file watching
 * - "prod": Production mode with pre-built assets, no live compilation
 */
type AppMode = "dev" | "prod";
/**
 * Creates and configures the main HTTP application handler.
 *
 * Initializes the middleware chain for handling requests in the following order:
 * 1. Request logging
 * 2. Internal runtime modules (hydration, HMR)
 * 3. API route handling
 * 4. Static dist directory serving (prod mode)
 * 5. SCSS compilation (dev mode)
 * 6. Site assets serving (dev mode)
 * 7. Server-side rendering (SSR) of route pages
 * 8. 404 fallback
 *
 * In development mode, sets up file watching on the site directory to enable:
 * - Hot Module Replacement (HMR) via Server-Sent Events (SSE)
 * - Hot CSS reload for SCSS changes
 * - Full page reload for JavaScript/TypeScript/framework file changes
 * - Module and compiler cache invalidation
 *
 * @param opts Configuration object
 * @param opts.config Jen.js framework configuration with routes, directories, etc.
 * @param opts.mode "dev" for development or "prod" for production
 * @param opts.viteServer Optional Vite dev server instance for HMR (dev mode only)
 *
 * @returns Promise resolving to an object with handle() method for processing HTTP requests
 *
 * @throws {Error} If route scanning fails due to invalid route patterns
 */
export declare function createApp(opts: {
  config: FrameworkConfig;
  mode: AppMode;
  viteServer?: any;
}): Promise<{
  handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
}>;
export {};
