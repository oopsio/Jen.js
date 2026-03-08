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
export function Island(Component, strategy) {
  // Mark component metadata for server-side detection
  Component.__island = true;
  Component.__hydrationStrategy = strategy;
  return Component;
}
/**
 * Generate island hydration markers for server-rendered HTML.
 * Call this after SSR to inject island metadata.
 */
export function createIslandMarker(id, componentPath, strategy, props) {
  const propsJson = JSON.stringify(props).replace(/</g, "\\u003c");
  return `<!--__ISLAND_${strategy.toUpperCase()}__:${id}:${componentPath}:${propsJson}-->`;
}
/**
 * Extract islands from server-rendered HTML.
 * Called by client to discover islands and their hydration strategy.
 */
export function extractIslandsFromHtml(html) {
  const islands = [];
  // Match: <!--__ISLAND_LOAD__:id:componentPath:props-->
  const regex = /<!--__ISLAND_(LOAD|IDLE|VISIBLE)__:([^:]+):([^:]+):(.+?)-->/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const strategy = match[1].toLowerCase();
    const id = match[2];
    const componentPath = match[3];
    const propsStr = match[4].replace(/\\u003c/g, "<");
    // Validate island ID and component path
    if (!id || !componentPath) {
      console.warn("Invalid island marker: missing id or componentPath");
      continue;
    }
    try {
      // Validate props is valid JSON
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
