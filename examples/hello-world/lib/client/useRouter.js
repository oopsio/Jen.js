import { useCallback, useEffect, useState } from "preact/hooks";
/**
 * Hook to access current route and navigate
 */
export function useRouter() {
    const [state, setState] = useState(() => ({
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
        const handleNavigate = (event) => {
            const { href } = event.detail;
            setState({
                pathname: new URL(href, window.location.href).pathname,
                search: new URL(href, window.location.href).search,
                hash: new URL(href, window.location.href).hash,
            });
        };
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("jen:navigate", handleNavigate);
        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("jen:navigate", handleNavigate);
        };
    }, []);
    const push = useCallback((href) => {
        window.dispatchEvent(new CustomEvent("jen:navigate", {
            detail: { href, replace: false },
        }));
        window.history.pushState({ href }, "", href);
        setState({
            pathname: new URL(href, window.location.href).pathname,
            search: new URL(href, window.location.href).search,
            hash: new URL(href, window.location.href).hash,
        });
    }, []);
    const replace = useCallback((href) => {
        window.dispatchEvent(new CustomEvent("jen:navigate", {
            detail: { href, replace: true },
        }));
        window.history.replaceState({ href }, "", href);
        setState({
            pathname: new URL(href, window.location.href).pathname,
            search: new URL(href, window.location.href).search,
            hash: new URL(href, window.location.href).hash,
        });
    }, []);
    return { ...state, push, replace };
}
