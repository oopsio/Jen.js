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

export interface Island {
  id: string;
  component: string;
  props: any;
}
export interface IslandRegistry {
  islands: Island[];
}
/**
 * Creates an empty island registry for a request
 */
export declare function createIslandRegistry(): IslandRegistry;
/**
 * Mark a component as an island (placeholder implementation)
 * In a real framework, this would be a decorator or a HOC
 */
export declare function markIsland(name: string, props: any): string;
/**
 * Extract islands from HTML string
 */
export declare function extractIslandsFromHtml(html: string): Island[];
/**
 * Inject hydration script into HTML
 */
export declare function injectIslandScript(
  html: string,
  islands: Island[],
): string;
