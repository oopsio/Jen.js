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

import { ResponseBuilder } from "./response.js";
export class Context {
  req;
  res;
  url;
  state;
  response;
  body; // For parsed body
  query;
  params;
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.url = new URL(
      req.url ?? "/",
      `http://${req.headers.host || "localhost"}`,
    );
    this.state = {};
    this.response = new ResponseBuilder(res);
    this.body = null;
    this.query = Object.fromEntries(this.url.searchParams);
    this.params = {};
  }
  get cookies() {
    const header = this.req.headers.cookie;
    if (!header) return {};
    return Object.fromEntries(
      header.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, decodeURIComponent(v.join("="))];
      }),
    );
  }
  json(data, status = 200) {
    return this.response.status(status).json(data).send();
  }
}
