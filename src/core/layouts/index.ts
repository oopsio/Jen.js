/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
