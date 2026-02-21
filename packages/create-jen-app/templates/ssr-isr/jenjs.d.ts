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

// Type declarations for local lib/ folder (bundled Jen.js framework)
declare module "lib" {
  export * from "./lib/index.js";
}

declare module "lib/core" {
  export * from "./lib/core/config.js";
  export * from "./lib/core/routes/scan.js";
  export * from "./lib/core/routes/match.js";
  export * from "./lib/core/middleware-hooks.js";
  export * from "./lib/core/http.js";
}

declare module "lib/runtime" {
  export * from "./lib/runtime/render.js";
  export * from "./lib/runtime/islands.js";
}

declare module "lib/server" {
  export * from "./lib/server/app.js";
  export * from "./lib/server/ssr.js";
}
