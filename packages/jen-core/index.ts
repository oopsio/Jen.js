import type { RouteEntry } from "../../src/core/routes/scan.js";
import type { MatchResult } from "../../src/core/routes/match.js";

/** Global Go object exposed by wasm_exec.js */
declare global {
  interface GoInstance {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
  }

  var Go: {
    new (): GoInstance;
  };

  interface Window {
    jenGo?: {
      scanRoutes(siteDir: string): {
        routes: RouteEntry[];
        error: string | null;
      };
      matchRoute(routesJSON: string, pathname: string): {
        match: MatchResult | null;
        error: string | null;
      };
      parseCookies(cookieHeader: string): {
        cookies: Record<string, string>;
        error: string | null;
      };
    };
  }
}

let wasmReady = false;

/**
 * Initializes the WebAssembly engine by loading and instantiating the WASM module.
 * Must be called before using scanRoutes, matchRoute, or parseCookies.
 *
 * @param wasmPath Optional path to engine.wasm (defaults to /src/core/engine.wasm)
 * @throws {Error} if WASM module fails to load or instantiate
 */
export async function initializeEngine(wasmPath: string = "/src/core/engine.wasm"): Promise<void> {
  if (wasmReady) {
    return;
  }

  try {
    // In browser environment, fetch and instantiate the WASM module
    if (typeof window === "undefined" || typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly not supported in this environment");
    }

    // Load Go runtime support if not already loaded
    if (typeof globalThis.Go === "undefined") {
      const goScript = document.createElement("script");
      goScript.src = "/src/core/wasm_exec.js";
      await new Promise<void>((resolve, reject) => {
        goScript.onload = () => resolve();
        goScript.onerror = () => reject(new Error("Failed to load wasm_exec.js"));
        document.head.appendChild(goScript);
      });
    }

    // Fetch and instantiate the WASM module
    const response = await fetch(wasmPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const goInstance = new globalThis.Go();
    const { instance } = await WebAssembly.instantiate(buffer, goInstance.importObject);

    // Run the Go program which will populate window.jenGo
    await goInstance.run(instance);

    wasmReady = true;
  } catch (error) {
    throw new Error(`Failed to initialize WASM engine: ${error}`);
  }
}

/**
 * Scans the configured siteDir for route files and returns an ordered list.
 * Requires the WASM engine to be initialized first via initializeEngine().
 *
 * @param siteDir Site directory path to scan
 * @returns Array of RouteEntry objects, sorted by specificity
 * @throws {Error} if WASM engine is not initialized or if scanning fails
 */
export function scanRoutes(siteDir: string): RouteEntry[] {
  if (!window.jenGo) {
    throw new Error(
      "WASM engine not initialized. Call initializeEngine() first.",
    );
  }

  const result = window.jenGo.scanRoutes(siteDir);
  if (result.error) {
    throw new Error(`scanRoutes failed: ${result.error}`);
  }

  return result.routes;
}

/**
 * Matches a URL pathname against a list of routes and returns the matching route with extracted parameters.
 * Requires the WASM engine to be initialized first via initializeEngine().
 *
 * @param routes Array of RouteEntry objects from scanRoutes()
 * @param pathname URL path to match, e.g., "/posts/42"
 * @returns MatchResult object with matched route and parameters, or null if no route matches
 * @throws {Error} if WASM engine is not initialized or if matching fails
 */
export function matchRoute(
  routes: RouteEntry[],
  pathname: string,
): MatchResult | null {
  if (!window.jenGo) {
    throw new Error(
      "WASM engine not initialized. Call initializeEngine() first.",
    );
  }

  const routesJSON = JSON.stringify(routes);
  const result = window.jenGo.matchRoute(routesJSON, pathname);

  if (result.error) {
    throw new Error(`matchRoute failed: ${result.error}`);
  }

  return result.match;
}

/**
 * Parses an HTTP Cookie header into a map of name-value pairs.
 * Values are automatically URL-decoded.
 * Requires the WASM engine to be initialized first via initializeEngine().
 *
 * @param cookieHeader The Cookie HTTP header value
 * @returns Object with cookie names as keys and decoded values
 * @throws {Error} if WASM engine is not initialized or if parsing fails
 */
export function parseCookies(
  cookieHeader: string,
): Record<string, string> {
  if (!window.jenGo) {
    throw new Error(
      "WASM engine not initialized. Call initializeEngine() first.",
    );
  }

  const result = window.jenGo.parseCookies(cookieHeader);
  if (result.error) {
    throw new Error(`parseCookies failed: ${result.error}`);
  }

  return result.cookies;
}

/**
 * Checks if the WASM engine is ready for use
 */
export function isEngineReady(): boolean {
  return wasmReady && typeof window !== "undefined" && !!window.jenGo;
}
