import { useEffect, useState } from "preact/hooks";
/**
 * Hook to track navigation state
 */
export function useNavigation() {
    const [isNavigating, setIsNavigating] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleNavigateStart = () => {
            setIsNavigating(true);
        };
        const handleNavigateEnd = () => {
            setIsNavigating(false);
        };
        window.addEventListener("jen:navigate:start", handleNavigateStart);
        window.addEventListener("jen:navigate:end", handleNavigateEnd);
        return () => {
            window.removeEventListener("jen:navigate:start", handleNavigateStart);
            window.removeEventListener("jen:navigate:end", handleNavigateEnd);
        };
    }, []);
    return { isNavigating };
}
