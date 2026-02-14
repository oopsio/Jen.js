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

export class MemoryCache {
  private store: Map<string, any> = new Map();

  set(key: string, value: any, ttlMs?: number) {
    this.store.set(key, value);
    if (ttlMs) setTimeout(() => this.store.delete(key), ttlMs);
  }

  get(key: string) {
    return this.store.get(key);
  }

  delete(key: string) {
    this.store.delete(key);
  }
}
