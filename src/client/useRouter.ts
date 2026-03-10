import { useCallback, useEffect, useState } from "preact/hooks";

export interface RouterState {
  pathname: string;
  search: string;
  hash: string;
}

/**
 * Hook to access current route and navigate
 */
export function useRouter() {
  const [state, setState] = useState<RouterState>(() => ({
    pathname: typeof window !== "undefined" ? window.location.pathname : "/",
    search: typeof window !== "undefined" ? window.location.search : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
  }));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setState({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    };

    const handleNavigate = (
      event: CustomEvent<{ href: string; replace: boolean }>,
    ) => {
      const { href } = event.detail;
      setState({
        pathname: new URL(href, window.location.href).pathname,
        search: new URL(href, window.location.href).search,
        hash: new URL(href, window.location.href).hash,
      });
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("jen:navigate", handleNavigate as EventListener);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("jen:navigate", handleNavigate as EventListener);
    };
  }, []);

  const push = useCallback((href: string) => {
    window.dispatchEvent(
      new CustomEvent("jen:navigate", {
        detail: { href, replace: false },
      }),
    );
    window.history.pushState({ href }, "", href);
    setState({
      pathname: new URL(href, window.location.href).pathname,
      search: new URL(href, window.location.href).search,
      hash: new URL(href, window.location.href).hash,
    });
  }, []);

  const replace = useCallback((href: string) => {
    window.dispatchEvent(
      new CustomEvent("jen:navigate", {
        detail: { href, replace: true },
      }),
    );
    window.history.replaceState({ href }, "", href);
    setState({
      pathname: new URL(href, window.location.href).pathname,
      search: new URL(href, window.location.href).search,
      hash: new URL(href, window.location.href).hash,
    });
  }, []);

  return { ...state, push, replace };
}
