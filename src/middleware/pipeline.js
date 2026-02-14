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

export class Pipeline {
  static compose(middleware) {
    if (!Array.isArray(middleware))
      throw new TypeError("Middleware stack must be an array!");
    const handlers = middleware.map((mw) => this.resolveMiddleware(mw));
    return function (context, next) {
      let index = -1;
      function dispatch(i) {
        if (i <= index)
          return Promise.reject(new Error("next() called multiple times"));
        index = i;
        let fn = handlers[i];
        if (i === handlers.length) {
          fn = next;
        }
        if (!fn) return Promise.resolve();
        try {
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      }
      return dispatch(0);
    };
  }
  static resolveMiddleware(mw) {
    if (typeof mw === "function") {
      // Check if it's a class constructor (has prototype.handle)
      if (
        "prototype" in mw &&
        mw.prototype &&
        typeof mw.prototype.handle === "function"
      ) {
        try {
          const instance = new mw();
          return instance.handle.bind(instance);
        } catch (e) {
          // If instantiation fails, assume it's a simple function middleware
          return mw;
        }
      }
      return mw;
    }
    if (typeof mw === "object" && mw !== null && "handle" in mw) {
      return mw.handle.bind(mw);
    }
    throw new TypeError(
      "Middleware must be a function, a class constructor, or an object with a handle() method",
    );
  }
}
