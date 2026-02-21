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
export declare function hydrateClient(entryPath: string): Promise<void>;
