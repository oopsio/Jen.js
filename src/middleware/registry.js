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

export class MiddlewareRegistry {
  static instance;
  middleware = new Map();
  groups = new Map();
  constructor() {}
  static get() {
    if (!this.instance) this.instance = new MiddlewareRegistry();
    return this.instance;
  }
  register(name, mw) {
    this.middleware.set(name, mw);
  }
  get(name) {
    return this.middleware.get(name);
  }
  group(groupName, middlewareNames) {
    this.groups.set(groupName, middlewareNames);
  }
  getGroup(groupName) {
    const names = this.groups.get(groupName) || [];
    return names.map((n) => this.get(n)).filter((m) => !!m);
  }
}
