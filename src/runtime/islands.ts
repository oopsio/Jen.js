import type { ComponentType } from "preact";

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
export function Island<P extends Record<string, any>>(
  Component: any,
  strategy: HydrationStrategy,
) {
  // Mark component metadata for server-side detection
  Component.__island = true;
  Component.__hydrationStrategy = strategy;
  return Component;
}

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
export function createIslandMarker(
  id: string,
  componentPath: string,
  strategy: HydrationStrategy,
  props: any,
): string {
  const propsJson = JSON.stringify(props).replace(/</g, "\\u003c");
  return `<!--__ISLAND_${strategy.toUpperCase()}__:${id}:${componentPath}:${propsJson}-->`;
}

/**
 * Extract islands from server-rendered HTML.
 * Called by client to discover islands and their hydration strategy.
 */
export function extractIslandsFromHtml(html: string): DetectedIsland[] {
  const islands: DetectedIsland[] = [];
  // Match: <!--__ISLAND_LOAD__:id:componentPath:props-->
  const regex = /<!--__ISLAND_(LOAD|IDLE|VISIBLE)__:([^:]+):([^:]+):(.+?)-->/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const strategy = match[1].toLowerCase() as HydrationStrategy;
    const id = match[2];
    const componentPath = match[3];
    const propsStr = match[4].replace(/\\u003c/g, "<");

    try {
      islands.push({
        id,
        component: componentPath,
        strategy,
        props: JSON.parse(propsStr),
      });
    } catch {
      // Skip malformed islands
    }
  }

  return islands;
}
