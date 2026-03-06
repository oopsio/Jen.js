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

import { ComponentChildren, h } from "preact";

export interface LinkProps {
  href: string;
  children: ComponentChildren;
  class?: string;
  [key: string]: any;
}

/**
 * Link component for client-side routing
 * Compiles to <a data-jen-link> at build time
 * Router auto-intercepts clicks
 */
export function Link({ href, children, ...props }: LinkProps) {
  return h(
    "a",
    {
      href,
      "data-jen-link": true,
      ...props,
    },
    children,
  );
}
