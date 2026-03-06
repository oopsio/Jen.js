import type { FrameworkConfig } from "../core/config.js";
import type { RouteEntry } from "../core/routes/scan.js";
/**
 * Renders a route module to a complete HTML document.
 * This function handles the entire server-side rendering pipeline:
 * 1. Compiles TypeScript/JSX/Vue/Svelte to JavaScript if needed
 * 2. Imports the compiled route module
 * 3. Executes route-level middleware
 * 4. Calls the loader to fetch data
 * 5. Renders the component to HTML using Preact
 * 6. Wraps the component HTML in a full document with hydration metadata if enabled
 *
 * Compilation is performed at request-time in development (for fast iteration) and at build-time in production.
 * The route module must export a default Preact component and may optionally export a loader function,
 * middleware, a Head component, and hydration strategy metadata.
 *
 * @param opts Configuration and context for rendering.
 * @param opts.config The framework configuration.
 * @param opts.route The route entry being rendered.
 * @param opts.req The Node.js IncomingMessage (optional for SSG).
 * @param opts.res The Node.js ServerResponse (optional for SSG).
 * @param opts.url The parsed request URL.
 * @param opts.params Dynamic route parameters extracted from the URL.
 * @param opts.query Query string parameters.
 * @param opts.headers HTTP request headers.
 * @param opts.cookies Parsed cookies from the request.
 * @returns The complete HTML document as a string.
 * @throws Error if the route module fails to compile, import, or render.
 */
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
