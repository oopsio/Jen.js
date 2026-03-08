/**
 * Nested layouts system for Jen.js
 * Provides automatic parent-child layout relationships with inheritance and overrides.
 */

export type { LayoutEntry } from "./scan.js";
export type { LayoutModule, ResolvedLayoutStack } from "./types.js";

export { scanLayouts, buildLayoutHierarchy } from "./scan.js";

export {
  resolveLayoutStack,
  renderWithLayoutStack,
  collectLayoutHeads,
} from "./render.js";
