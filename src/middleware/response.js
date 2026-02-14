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

export class ResponseBuilder {
  statusCode = 200;
  headers = {};
  body = null;
  res;
  constructor(res) {
    this.res = res;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  header(key, value) {
    this.headers[key] = value;
    return this;
  }
  json(data) {
    this.header("Content-Type", "application/json");
    this.body = JSON.stringify(data);
    return this;
  }
  html(html) {
    this.header("Content-Type", "text/html");
    this.body = html;
    return this;
  }
  text(text) {
    this.header("Content-Type", "text/plain");
    this.body = text;
    return this;
  }
  send() {
    if (this.res.writableEnded) return;
    this.res.writeHead(this.statusCode, this.headers);
    if (this.body !== null && this.body !== undefined) {
      this.res.end(this.body);
    } else {
      this.res.end();
    }
  }
}
