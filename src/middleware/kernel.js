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

import { Pipeline } from "./pipeline.js";
import { MiddlewareRegistry } from "./registry.js";
import { Context } from "./context.js";
export class Kernel {
  globalMiddleware = [];
  constructor() {}
  use(mw) {
    this.globalMiddleware.push(mw);
  }
  async handle(req, res) {
    const ctx = new Context(req, res);
    const fn = Pipeline.compose(this.globalMiddleware);
    await fn(ctx, async () => {});
  }
  async handleWithGroup(req, res, groupName) {
    const ctx = new Context(req, res);
    const registry = MiddlewareRegistry.get();
    const groupMw = registry.getGroup(groupName);
    const fn = Pipeline.compose([...this.globalMiddleware, ...groupMw]);
    await fn(ctx, async () => {});
  }
}
