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

import type { IncomingMessage } from "node:http";

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookie = req.headers.cookie;
  if (!cookie) return {};
  const out: Record<string, string> = {};
  for (const part of cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    const trimmedName = k.trim();
    const trimmedValue = rest.join("=").trim();
    if (trimmedName && trimmedValue) {
      out[trimmedName] = decodeURIComponent(trimmedValue);
    }
  }
  return out;
}

export function headersToObject(
  headers: IncomingMessage["headers"],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (Array.isArray(v)) out[k] = v.join(", ");
    else if (typeof v === "string") out[k] = v;
  }
  return out;
}
