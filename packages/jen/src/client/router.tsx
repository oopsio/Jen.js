import { h, createContext, ComponentType } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

declare global {
  interface Window {
    __JEN_ROUTE_MANIFEST__?: Record<
      string,
      { page: string; layouts: string[]; isDynamic: boolean }
    >;
  }
}

// Context to provide router state and methods
const RouterContext = createContext<{
  path: string;
  push: (href: string) => void;
  replace: (href: string) => void;
} | null>(null);

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a <Router />');
  }
  return context;
}

export interface RouterProps {
  initialPath: string;
  initialPagePath?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialComponents?: ComponentType<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
}

function matchRouteManifest(href: string) {
  const manifest =
    typeof window !== 'undefined' ? window.__JEN_ROUTE_MANIFEST__ : null;
  if (!manifest) return null;

  const url = new URL(href, window.location.origin);
  const pathName = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');

  for (const [routePattern, routeDef] of Object.entries(manifest)) {
    if (!routeDef.isDynamic) {
      if (routePattern === pathName) return routeDef;
    } else {
      const regexStr = '^' + routePattern.replace(/:[^\s/]+/g, '([^/]+)') + '$';
      if (new RegExp(regexStr).test(pathName)) {
        return routeDef;
      }
    }
  }
  return null;
}

/**
 * Recursively mounts the component tree to preserve parent layout states.
 */
 
function RouteNode({
  components,
  depth,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: ComponentType<any>[];
  depth: number;
}) {
  const Component = components[depth];
  if (!Component) return null;

  if (depth === components.length - 1) {
    return h(Component, {});
  }

  return h(Component, {}, h(RouteNode, { components, depth: depth + 1 }));
}

/**
 * Client-side Router component.
 * Features state-preserving nested layout routing leveraging Vite's code-splitting.
 */
export function Router({
  initialPath,
  initialComponents,
  children,
}: RouterProps) {
  const [path, setPath] = useState(initialPath);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [componentsTree, setComponentsTree] = useState<ComponentType<any>[]>(
    initialComponents || [],
  );
  const [loading, setLoading] = useState(false);

  // SSR fallback: if no initialComponents were provided, render children directly
  const isSSR = typeof window === 'undefined';

  const navigate = async (href: string, replace = false) => {
    if (typeof window === 'undefined') return;
    if (path === href) return;
    setLoading(true);

    try {
      // 1. Fetch the HTML to guarantee server side effects and extract metadata (title, metrics)
      const response = await fetch(href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const routeDef = matchRouteManifest(href);
      if (!routeDef) {
        throw new Error(`Route ${href} not found in client manifest.`);
      }

      // 2. Import the layout tree and the leaf page dynamically in parallel
      const layoutPromises = routeDef.layouts.map(
        (l) => import(/* @vite-ignore */ l),
      );
      const pagePromise = import(/* @vite-ignore */ routeDef.page);

      const layoutModules = await Promise.all(layoutPromises);
      const pageModule = await pagePromise;

      const newComponents = [
        ...layoutModules.map((m) => m.default),
        pageModule.default,
      ];

      // 3. Update router state
      if (replace) {
        window.history.replaceState({}, '', href);
      } else {
        window.history.pushState({}, '', href);
      }

      document.title = doc.title;
      setPath(href);
      setComponentsTree(newComponents);

      window.dispatchEvent(
        new CustomEvent('jen-route-change', { detail: { href } }),
      );
    } catch (e) {
      console.error('[Jen Router] Soft navigation failed:', e);
      // Hard navigation fallback
      window.location.href = href;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => navigate(window.location.pathname, true);
    const handleJenNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string }>;
      navigate(customEvent.detail.href);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('jen-navigation', handleJenNav);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('jen-navigation', handleJenNav);
    };
  }, [path]);

  const push = (href: string) => navigate(href, false);
  const replace = (href: string) => navigate(href, true);

  return (
    <RouterContext.Provider value={{ path, push, replace }}>
      {isSSR && children
        ? children
        : componentsTree.length > 0
          ? h(RouteNode, { components: componentsTree, depth: 0 })
          : children}

      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: '#00ff00',
            zIndex: 9999,
            animation: 'jen-loader 2s infinite ease-in-out',
          }}
        />
      )}
      <style>{`
        @keyframes jen-loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </RouterContext.Provider>
  );
}
