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

import { log } from "../../shared/log.js";
export async function logger(ctx, next) {
  const start = performance.now();
  // Log request
  const method = ctx.req.method;
  const url = ctx.url.pathname;
  const id = ctx.state.requestId ? `[${ctx.state.requestId}]` : "";
  log.info(`${id} -> ${method} ${url}`);
  try {
    await next();
  } finally {
    const ms = (performance.now() - start).toFixed(2);
    log.info(`${id} <- ${method} ${url} ${ctx.res.statusCode} (${ms}ms)`);
  }
}
