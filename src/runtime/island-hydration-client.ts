import { hydrate } from "preact";
import { h } from "preact";

/**
 * Client-side island hydration
 * Discovers islands from HTML and hydrates them based on strategy
 */

interface Island {
  id: string;
  component: string;
  strategy: "load" | "idle" | "visible";
  props: any;
}

/**
 * Extract islands from HTML markers
 * Format: <!--__ISLAND_LOAD__:id:componentPath:props-->
 */
function extractIslands(): Island[] {
  const islands: Island[] = [];
  const html = document.documentElement.outerHTML;
  const regex = /<!--__ISLAND_(LOAD|IDLE|VISIBLE)__:([^:]+):([^:]+):(.+?)-->/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const strategy = match[1].toLowerCase() as "load" | "idle" | "visible";
    const id = match[2];
    const component = match[3];
    const propsStr = match[4].replace(/\\u003c/g, "<");

    try {
      islands.push({
        id,
        component,
        strategy,
        props: JSON.parse(propsStr),
      });
    } catch {
      console.warn(`Failed to parse island ${id}`);
    }
  }

  return islands;
}

/**
 * Hydrate a single island
 */
async function hydrateIsland(island: Island) {
  const target = document.getElementById(island.id);
  if (!target) {
    console.warn(`Island target #${island.id} not found`);
    return;
  }

  try {
    // Import the hydration module for this route
    const hydrationUrl = `/__hydrate?file=${encodeURIComponent(island.component)}`;
    const mod = await import(hydrationUrl);

    const Component = mod.default;
    if (!Component) {
      console.warn(`Component not exported from ${island.component}`);
      return;
    }

    const app = h(Component, island.props);
    hydrate(app, target);
  } catch (err) {
    console.error(`Failed to hydrate island ${island.id}:`, err);
  }
}

/**
 * Hydrate islands based on strategy
 */
function hydrateWithStrategy(islands: Island[]) {
  for (const island of islands) {
    switch (island.strategy) {
      case "load":
        // Hydrate immediately
        hydrateIsland(island);
        break;

      case "idle":
        // Hydrate when browser is idle
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => hydrateIsland(island));
        } else {
          // Fallback: hydrate after a delay
          setTimeout(() => hydrateIsland(island), 2000);
        }
        break;

      case "visible":
        // Hydrate when element is visible
        if ("IntersectionObserver" in window) {
          const target = document.getElementById(island.id);
          if (target) {
            const observer = new IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting) {
                  hydrateIsland(island);
                  observer.disconnect();
                }
              },
              { threshold: 0.1 },
            );
            observer.observe(target);
          }
        } else {
          // Fallback: hydrate after delay
          setTimeout(() => hydrateIsland(island), 3000);
        }
        break;
    }
  }
}

/**
 * Initialize island hydration
 * Called by framework at page load
 */
export function initializeIslands() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const islands = extractIslands();
      hydrateWithStrategy(islands);
    });
  } else {
    const islands = extractIslands();
    hydrateWithStrategy(islands);
  }
}

// Auto-initialize on import
initializeIslands();
