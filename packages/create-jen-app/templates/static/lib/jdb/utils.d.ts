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

export declare function ensureDir(dir: string): Promise<void>;
export declare function readJSON<T>(file: string): Promise<T | null>;
export declare function writeJSON(file: string, data: any): Promise<void>;
export declare function generateId(): string;
export declare function matchFilter(doc: any, filter: any): boolean;
export declare function applyUpdate(doc: any, update: any): void;
