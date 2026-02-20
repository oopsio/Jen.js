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

import type { RenderMode } from "./config.js";

/**
 * Exported interface that every route module (TSX/JSX file in siteDir) must conform to.
 * Route modules define the page content, metadata, data loading, and rendering behavior.
 *
 * @example
 * ```typescript
 * import type { RouteModule } from "jenjs";
 *
 * export const mode = "ssg"; // Pre-render at build time
 * export const revalidateSeconds = 3600; // Revalidate every hour for ISR
 *
 * export const loader = async (ctx) => {
 *   return { posts: await fetchPosts() };
 * };
 *
 * export function Head() {
 *   return <title>My Page</title>;
 * }
 *
 * export default function Page({ data, params }) {
 *   return <div>Welcome!</div>;
 * }
 * ```
 */
export type RouteModule = {
  /**
   * Rendering mode for this route.
   * If omitted, uses defaultMode from config.
   *
   * - "ssr": Server-side render on every request
   * - "ssg": Pre-render once at build time
   * - "isr": Pre-render, then revalidate on demand
   * - "ppr": Partial pre-rendering (some sections static, some dynamic)
   */
  mode?: RenderMode;

  /**
   * For ISR routes, the time in seconds before cached page is considered stale.
   * When a request comes to a stale page, it triggers a background revalidation.
   * If omitted, uses defaultRevalidateSeconds from config.
   *
   * Example: 3600 = revalidate every hour
   */
  revalidateSeconds?: number;

  /**
   * Whether to inject hydration code and client-side JavaScript.
   * Set to false for pure static HTML with no interactivity.
   * Default: true (enables interactive components)
   *
   * Optimization: Static pages (false) have smaller payload and faster rendering.
   */
  hydrate?: boolean;

  /**
   * Route-level middleware functions that run before rendering.
   * Can be a single middleware or array of middlewares.
   * Executes on the server before loader is called.
   * Can access request, set response headers, perform auth checks, etc.
   *
   * @see ../middleware-hooks.ts for RouteMiddleware interface
   */
  middleware?: any;

  /**
   * Data loading function called before rendering the page.
   * Receives LoaderContext with URL, params, query, headers, cookies, and middleware data.
   * Result is passed to the page component as `data` prop.
   * Can be async (e.g., fetch from database or API).
   *
   * Only runs on the server (SSR/SSG), not on the client during hydration.
   *
   * @param ctx Loader context with request information
   * @returns Data object merged with component props
   */
  loader?: (ctx: LoaderContext) => Promise<any> | any;

  /**
   * Optional Head component exported from route module.
   * Renders into <head> section of the HTML document.
   * Useful for meta tags, title, Open Graph tags, etc.
   *
   * Receives the same props as the default page component: { data, params, query }
   *
   * @example
   * ```typescript
   * export function Head({ params }) {
   *   return <title>{params.id} - My Site</title>;
   * }
   * ```
   */
  Head?: (props: any) => any;

  /**
   * Required default export: the page component.
   * Renders to HTML for SSR/SSG.
   * Also used for client-side hydration if hydrate !== false.
   *
   * Receives props: { data, params, query }
   *
   * @example
   * ```typescript
   * export default function Page({ data, params, query }) {
   *   return <main>{data?.title}</main>;
   * }
   * ```
   */
  default: (props: any) => any;
};

/**
 * Context object passed to route loader functions.
 * Contains all request-related data needed to load route data dynamically.
 * Available in both SSR (runtime) and SSG (build-time) contexts.
 */
export type LoaderContext = {
  /**
   * The full URL object for the current request.
   * Includes pathname, search, searchParams, etc.
   * @example new URL("http://example.com/posts?sort=date")
   */
  url: URL;

  /**
   * Named route parameters extracted from the URL path.
   * For route /posts/:id, accessing /posts/42 yields { id: "42" }
   * For catch-all routes /docs/...rest, yields { rest: "getting-started/setup" }
   */
  params: Record<string, string>;

  /**
   * Query string parameters from the URL search string.
   * For URL /search?q=test&limit=10, yields { q: "test", limit: "10" }
   * Always strings; parsing to numbers/booleans is the loader's responsibility.
   */
  query: Record<string, string>;

  /**
   * HTTP request headers as a flat object.
   * Keys are lowercase; multiple header values are comma-separated.
   * Not available during static site generation (SSG build-time).
   *
   * @example { "content-type": "application/json", "user-agent": "..." }
   */
  headers: Record<string, string>;

  /**
   * Parsed HTTP cookies from the request.
   * Automatically extracted from the Cookie header.
   * Not available during static site generation (SSG build-time).
   *
   * @example { "sessionId": "abc123", "theme": "dark" }
   */
  cookies: Record<string, string>;

  /**
   * Additional data attached by route middleware.
   * Middleware can populate this field to pass data to the loader and page component.
   * Useful for authentication info, locale, user preferences, etc.
   *
   * @example { "userId": 42, "isAdmin": true }
   */
  data?: Record<string, any>;
};
