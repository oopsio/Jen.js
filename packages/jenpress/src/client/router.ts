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

/**
 * Client-side router for JenPress
 */

export interface Route {
  path: string;
  component: any;
  params?: Record<string, string>;
}

export class Router {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;

  register(path: string, component: any) {
    this.routes.push({ path, component });
  }

  match(pathname: string): Route | null {
    for (const route of this.routes) {
      const pattern = route.path
        .replace(/\[([^\]]+)\]/g, '(?<$1>[^/]+)')
        .replace(/\//g, '\\/')
        .replace(/\*/g, '.*');

      const regex = new RegExp(`^${pattern}$`);
      const match = pathname.match(regex);

      if (match) {
        return {
          ...route,
          params: match.groups || {},
        };
      }
    }

    return null;
  }

  async navigate(pathname: string): Promise<Route | null> {
    const route = this.match(pathname);
    if (route) {
      this.currentRoute = route;
      window.history.pushState({}, '', pathname);
    }
    return route;
  }

  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }
}

export const router = new Router();
