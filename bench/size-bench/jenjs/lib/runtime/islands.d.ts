export type HydrationStrategy = "load" | "idle" | "visible";
export interface IslandProps {
  "client:load"?: boolean;
  "client:idle"?: boolean;
  "client:visible"?: boolean;
}
/**
 * Mark a component as an interactive island.
 * Wraps component with hydration metadata.
 *
 * Usage in route:
 *   import { Island } from "jenjs";
 *   const Counter = Island(CounterImpl, "load");
 *
 * Then use in JSX: <Counter count={5} />
 *
 * Server will:
 * - Render the component to HTML
 * - Emit hydration markers
 * - Include serialized props
 *
 * Client will:
 * - Discover islands from markers
 * - Hydrate based on strategy
 */
export declare function Island<P extends Record<string, any>>(
  Component: any,
  strategy: HydrationStrategy,
): any;
/**
 * Detect islands in a component tree (called by server renderer).
 * Returns array of island metadata to inject into HTML.
 */
export interface DetectedIsland {
  id: string;
  component: string;
  strategy: HydrationStrategy;
  props: any;
}
/**
 * Generate island hydration markers for server-rendered HTML.
 * Call this after SSR to inject island metadata.
 */
export declare function createIslandMarker(
  id: string,
  componentPath: string,
  strategy: HydrationStrategy,
  props: any,
): string;
/**
 * Extract islands from server-rendered HTML.
 * Called by client to discover islands and their hydration strategy.
 */
export declare function extractIslandsFromHtml(html: string): DetectedIsland[];
