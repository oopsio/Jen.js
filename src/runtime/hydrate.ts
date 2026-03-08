import { hydrate } from "preact";
import { h } from "preact";
import { getFrameworkData } from "./client-runtime.js";

/**
 * Hydrate a server-rendered page with client-side interactivity.
 * This function is called once on page load in the browser.
 * It attaches Preact event listeners and state management to existing DOM without re-rendering.
 *
 * Flow:
 * 1. Retrieve framework data (loader result, route params, query) injected by server into page HTML
 * 2. Dynamically import the route component module
 * 3. Construct Preact component tree passing data as props
 * 4. Attach to existing #app element (matches server-rendered HTML structure)
 *
 * Errors during hydration are logged but do not throw; the page remains functional
 * with reduced interactivity if hydration fails.
 *
 * @param entryPath - Path to the route component module (e.g., "./routes/index.js")
 *   This path is typically injected into the HTML as a script attribute by the server.
 */
export async function hydrateClient(entryPath: string) {
  try {
    // Retrieve loader data, params, and query injected into page HTML by server
    const data = getFrameworkData();
    // Dynamically import route component
    const mod = await import(entryPath);

    // Validate that route exports a default component
    if (!mod.default) {
      console.error(
        `Failed to hydrate: route module does not export default component`,
      );
      return;
    }

    // Construct Preact VDOM tree with data as props
    const Page = mod.default;
    const app = h(Page, {
      data: data?.data ?? null,
      params: data?.params ?? {},
      query: data?.query ?? {},
    });

    // Find root DOM element for hydration
    const root = document.getElementById("app");
    if (!root) {
      console.error("Failed to hydrate: #app element not found in DOM");
      return;
    }

    // Attach Preact to existing DOM tree without re-rendering
    hydrate(app, root);
  } catch (err) {
    console.error(
      "Hydration failed:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
