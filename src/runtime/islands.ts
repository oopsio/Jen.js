import type { ComponentType } from "preact";

/**
 * Hydration strategy for interactive islands.
 * Determines when client-side JavaScript is loaded and hydration occurs:
 * - "load": Hydrate immediately on page load (eager)
 * - "idle": Hydrate when browser is idle via requestIdleCallback (deferred, low-priority)
 * - "visible": Hydrate when island becomes visible via IntersectionObserver (viewport-based)
 */
export type HydrationStrategy = "load" | "idle" | "visible";

/**
 * Props interface for islands (not actively used, provided for type reference).
 */
export interface IslandProps {
  "client:load"?: boolean;
  "client:idle"?: boolean;
  "client:visible"?: boolean;
}

/**
 * Mark a component as an interactive island for partial hydration.
 * Islands are components that require client-side interactivity while the rest of the page
 * remains static HTML. This enables efficient selective hydration.
 *
 * How it works:
 * - Marks component with metadata (__island, __hydrationStrategy)
 * - Server renderer detects marked components and emits HTML comments with island metadata
 * - Client JavaScript discovers islands from HTML comments and hydrates based on strategy
 *
 * Usage in route:
 *   import { Island } from "jenjs";
 *   import CounterImpl from "./counter.tsx";
 *   export default function Page() {
 *     const Counter = Island(CounterImpl, "load");
 *     return <Counter count={5} />;
 *   }
 *
 * Strategies:
 * - "load": Best for above-the-fold critical interactive components
 * - "idle": Good for secondary interactive elements (lighter priority)
 * - "visible": Best for below-the-fold components; hydrates only when scrolled into view
 *
 * @param Component - The Preact component to mark as an island.
 * @param strategy - Hydration timing strategy.
 * @returns The same component with island metadata attached.
 */
export function Island<P extends Record<string, any>>(
  Component: any,
  strategy: HydrationStrategy,
) {
  // Mark component metadata for server-side detection during SSR
  Component.__island = true;
  Component.__hydrationStrategy = strategy;
  return Component;
}

/**
 * Metadata for a detected island extracted from server-rendered HTML.
 * Includes the island's unique ID, component path, hydration strategy, and serialized props.
 */
export interface DetectedIsland {
  /** Unique identifier for this island instance on the page. */
  id: string;
  /** Path to the component module (e.g., "./components/counter.js"). */
  component: string;
  /** Hydration strategy: when to hydrate this island. */
  strategy: HydrationStrategy;
  /** Serialized component props (deserialized from JSON in HTML comment). */
  props: any;
}

/**
 * Generate an HTML comment marker that encodes island metadata.
 * Server renderer calls this after rendering each island component.
 * The marker is embedded in the HTML and later parsed by the client.
 *
 * Format: <!--__ISLAND_{STRATEGY}__:{id}:{componentPath}:{propsJson}-->
 * Example: <!--__ISLAND_LOAD__:island-1:./counter.js:{"count":5}-->
 *
 * Note: '<' in JSON is escaped to '\\u003c' to prevent breaking HTML parsing
 * (literal '<' in props could confuse the HTML parser or regex extraction).
 *
 * @param id - Unique identifier for the island (e.g., "island-1", "counter-2").
 * @param componentPath - Path to the component module.
 * @param strategy - Hydration timing strategy.
 * @param props - Component props object (will be JSON.stringify'd).
 * @returns HTML comment string encoding the island metadata.
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
 * Extract island metadata from server-rendered HTML.
 * Client-side function that parses island markers from HTML comments.
 * Called during page initialization to discover which components need hydration.
 *
 * Parsing strategy:
 * - Regex finds HTML comments matching the island marker format
 * - Extracts strategy, id, componentPath, and props from comment
 * - Validates all fields are present and props are valid JSON
 * - Logs warnings for invalid markers but continues processing remaining islands
 *
 * Return value includes only valid, parseable islands; invalid ones are skipped.
 *
 * @param html - Server-rendered HTML string (typically document.body.innerHTML or full page HTML).
 * @returns Array of detected islands with complete metadata ready for hydration.
 */
export function extractIslandsFromHtml(html: string): DetectedIsland[] {
  const islands: DetectedIsland[] = [];
  // Regex to match: <!--__ISLAND_{LOAD|IDLE|VISIBLE}__:id:componentPath:propsJson-->
  const regex = /<!--__ISLAND_(LOAD|IDLE|VISIBLE)__:([^:]+):([^:]+):(.+?)-->/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const strategy = match[1].toLowerCase() as HydrationStrategy;
    const id = match[2];
    const componentPath = match[3];
    // Unescape '<' back to literal character
    const propsStr = match[4].replace(/\\u003c/g, "<");

    // Validate required fields
    if (!id || !componentPath) {
      console.warn("Invalid island marker: missing id or componentPath");
      continue;
    }

    try {
      // Parse props JSON and validate it's an object
      const props = JSON.parse(propsStr);
      if (typeof props !== "object" || props === null) {
        console.warn(
          `Invalid props for island ${id}: expected object, got ${typeof props}`,
        );
        continue;
      }

      islands.push({
        id,
        component: componentPath,
        strategy,
        props,
      });
    } catch (err) {
      console.warn(
        `Failed to parse props for island ${id}:`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  return islands;
}
