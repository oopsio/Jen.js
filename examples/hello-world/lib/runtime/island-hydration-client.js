import { hydrate } from "preact";
import { h } from "preact";
/**
 * Extract island metadata from HTML comment markers.
 * Scans the entire document for markers in the format:
 * <!--__ISLAND_{LOAD|IDLE|VISIBLE}__:id:componentPath:propsJson-->
 *
 * Silently skips malformed markers and continues processing remaining islands.
 * This resilience allows graceful degradation if some islands fail to parse.
 *
 * @returns Array of detected islands ready for hydration.
 */
function extractIslands() {
    const islands = [];
    const html = document.documentElement.outerHTML;
    // Regex matches: <!--__ISLAND_{LOAD|IDLE|VISIBLE}__:id:componentPath:propsJson-->
    const regex = /<!--__ISLAND_(LOAD|IDLE|VISIBLE)__:([^:]+):([^:]+):(.+?)-->/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const strategy = match[1].toLowerCase();
        const id = match[2];
        const component = match[3];
        // Unescape '<' that was escaped to prevent HTML parsing issues
        const propsStr = match[4].replace(/\\u003c/g, "<");
        try {
            islands.push({
                id,
                component,
                strategy,
                props: JSON.parse(propsStr),
            });
        }
        catch {
            console.warn(`Failed to parse island ${id}`);
        }
    }
    return islands;
}
/**
 * Hydrate a single island by importing its component and attaching Preact listeners.
 * Dynamically imports the component module via a hydration endpoint to ensure
 * the component code is loaded before hydration.
 *
 * If the DOM element (island.id) is not found, logs a warning and returns early.
 * If the component import or hydration fails, logs an error but does not propagate.
 * This resilience prevents one failed island from breaking others.
 *
 * @param island - Island metadata including id, component path, and props.
 */
async function hydrateIsland(island) {
    const target = document.getElementById(island.id);
    if (!target) {
        console.warn(`Island target #${island.id} not found`);
        return;
    }
    try {
        // Import component via hydration endpoint which ensures proper module resolution
        const hydrationUrl = `/__hydrate?file=${encodeURIComponent(island.component)}`;
        const mod = await import(hydrationUrl);
        const Component = mod.default;
        if (!Component) {
            console.warn(`Component not exported from ${island.component}`);
            return;
        }
        // Construct Preact VDOM with island props and attach to DOM element
        const app = h(Component, island.props);
        hydrate(app, target);
    }
    catch (err) {
        console.error(`Failed to hydrate island ${island.id}:`, err);
    }
}
/**
 * Orchestrate island hydration based on strategy.
 * Distributes hydration across the timeline to optimize page load performance.
 *
 * Strategies:
 * - "load": Hydrate immediately (for critical above-the-fold interactive components)
 * - "idle": Hydrate when browser is idle (requestIdleCallback, or 2000ms fallback)
 * - "visible": Hydrate when element scrolls into view (IntersectionObserver, or 3000ms fallback)
 *
 * Fallbacks ensure older browsers still hydrate despite missing modern APIs.
 *
 * @param islands - Array of islands to hydrate.
 */
function hydrateWithStrategy(islands) {
    for (const island of islands) {
        switch (island.strategy) {
            case "load":
                // Hydrate immediately for critical interactive components
                hydrateIsland(island);
                break;
            case "idle":
                // Hydrate when browser is idle to avoid blocking user interaction
                if ("requestIdleCallback" in window) {
                    requestIdleCallback(() => hydrateIsland(island));
                }
                else {
                    // Fallback: hydrate after 2 seconds (allows critical path to complete)
                    setTimeout(() => hydrateIsland(island), 2000);
                }
                break;
            case "visible":
                // Hydrate only when element becomes visible in the viewport
                if ("IntersectionObserver" in window) {
                    const target = document.getElementById(island.id);
                    if (target) {
                        const observer = new IntersectionObserver((entries) => {
                            // Hydrate on first intersection and stop observing
                            if (entries[0].isIntersecting) {
                                hydrateIsland(island);
                                observer.disconnect();
                            }
                        }, { threshold: 0.1 });
                        observer.observe(target);
                    }
                }
                else {
                    // Fallback: hydrate after 3 seconds (reasonable delay for below-fold elements)
                    setTimeout(() => hydrateIsland(island), 3000);
                }
                break;
        }
    }
}
/**
 * Initialize island hydration when DOM is ready.
 * Waits for DOMContentLoaded if the page is still loading, otherwise starts immediately.
 * This ensures island DOM elements exist before hydration attempts.
 *
 * Called automatically on module import.
 */
export function initializeIslands() {
    if (document.readyState === "loading") {
        // DOM still loading; wait for DOMContentLoaded before extracting islands
        document.addEventListener("DOMContentLoaded", () => {
            const islands = extractIslands();
            hydrateWithStrategy(islands);
        });
    }
    else {
        // DOM already loaded; hydrate immediately
        const islands = extractIslands();
        hydrateWithStrategy(islands);
    }
}
// Auto-initialize on import (framework injects this script into HTML in dev mode)
initializeIslands();
