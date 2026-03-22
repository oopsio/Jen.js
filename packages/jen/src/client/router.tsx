import { h, createContext, ComponentType } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

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
  initialPagePath: string;
  children?: preact.ComponentChildren;
}

export function Router({
  initialPath,
  initialPagePath,
  children: initialChildren,
}: RouterProps) {
  const [path, setPath] = useState(initialPath);
  const [, setPagePath] = useState(initialPagePath);
  // On hydration, PageComponent should be null to allow 'children' (the SSR'd content) to render
  const [PageComponent, setPageComponent] = useState<ComponentType | null>(
    null,
  );
  const [children, setChildren] = useState(initialChildren);
  const [loading, setLoading] = useState(false);

  const navigate = async (href: string, replace = false) => {
    if (typeof window === 'undefined') return;
    if (path === href) return;
    setLoading(true);

    try {
      // 1. Fetch the page to get its data-page-path
      const response = await fetch(href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const container = doc.getElementById('jen-root');

      if (!container) throw new Error('No #jen-root found in target page');

      const nextPagePath = container.dataset.pagePath;
      if (!nextPagePath) throw new Error('No data-page-path found');

      // 2. Import the new component
      const module = await import(/* @vite-ignore */ nextPagePath);

      // 3. Update state and History API
      if (replace) {
        window.history.replaceState({}, '', href);
      } else {
        window.history.pushState({}, '', href);
      }

      document.title = doc.title;
      setPath(href);
      setPagePath(nextPagePath);
      setPageComponent(() => module.default);
      setChildren(null); // Clear initial children once we navigate away

      // Notify custom Link components if they aren't using this Router state
      window.dispatchEvent(
        new CustomEvent('jen-route-change', { detail: { href } }),
      );
    } catch (e) {
      console.error('[Jen Router] Navigation failed:', e);
      // Fallback: hard navigation
      window.location.href = href;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      // On popstate, we have to do a full "soft" navigate because we need the component
      navigate(window.location.pathname, true);
    };

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
      {PageComponent ? h(PageComponent, {}) : children || null}
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
