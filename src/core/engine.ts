/**
 * High-performance Go/WebAssembly engine integration for routing and HTTP utilities.
 * Re-exports the jen-core WASM module with TypeScript wrappers.
 */

export {
  initializeEngine,
  scanRoutes,
  matchRoute,
  parseCookies,
  isEngineReady,
} from "../../packages/jen-core/index.js";

export type { RouteEntry } from "./routes/scan.js";
export type { MatchResult } from "./routes/match.js";
