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
