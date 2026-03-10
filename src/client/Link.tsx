"use client";

import { h, type VNode } from "preact";
import { useRef, useEffect, useCallback, useState } from "preact/hooks";
import type { JSX } from "preact";

export interface LinkProps extends Omit<
  JSX.HTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick" | "ref"
> {
  /** URL to navigate to */
  href: string;
  /** Replace history instead of pushing */
  replace?: boolean;
  /** Scroll to top on navigation */
  scroll?: boolean;
  /** Prefetch the page */
  prefetch?: boolean;
  /** Children to render */
  children?: JSX.Element | string;
  /** Click handler */
  onClick?: (e: MouseEvent) => void;
  /** Mouse enter handler */
  onMouseEnter?: (e: MouseEvent) => void;
  /** Touch start handler */
  onTouchStart?: (e: TouchEvent) => void;
}

const prefetched = new Set<string>();

/**
 * Checks if a click event should trigger default browser behavior
 */
function isModifiedEvent(event: MouseEvent): boolean {
  const target = (event.currentTarget as HTMLAnchorElement)?.getAttribute(
    "target",
  );
  return (
    (target && target !== "_self") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button === 1 // middle click
  );
}

/**
 * Checks if URL is internal
 */
function isLocalUrl(href: string): boolean {
  if (!href.startsWith("/")) {
    return false;
  }
  try {
    // Ensure it's a valid local URL
    const url = new URL(
      href,
      typeof window !== "undefined" ? window.location.href : "http://localhost",
    );
    return (
      url.hostname ===
      (typeof window !== "undefined" ? window.location.hostname : "localhost")
    );
  } catch {
    return true; // Assume local if parsing fails
  }
}

/**
 * Prefetch a page
 */
function prefetchPage(href: string): void {
  if (typeof window === "undefined" || !isLocalUrl(href)) {
    return;
  }

  if (prefetched.has(href)) {
    return;
  }

  prefetched.add(href);

  // Use Intersection Observer + fetch to prefetch
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Navigate to URL using client-side routing
 */
function navigateTo(href: string, replace: boolean = false): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isLocalUrl(href)) {
    if (replace) {
      window.location.replace(href);
    } else {
      window.location.href = href;
    }
    return;
  }

  // Dispatch custom navigation event
  window.dispatchEvent(
    new CustomEvent("jen:navigate", {
      detail: { href, replace },
    }),
  );

  // Fallback: use history API
  if (replace) {
    window.history.replaceState({ href }, "", href);
  } else {
    window.history.pushState({ href }, "", href);
  }

  // Scroll to top if enabled
  window.scrollTo(0, 0);
}

/**
 * Handles link click events
 */
function handleLinkClick(
  event: MouseEvent,
  href: string,
  replace: boolean = false,
  onClick?: (e: MouseEvent) => void,
): void {
  const target = event.currentTarget as HTMLAnchorElement | null;

  // Call custom handler if provided
  if (onClick) {
    onClick(event);
  }

  // Allow modified clicks (meta, ctrl, shift, alt) and downloads
  if (isModifiedEvent(event) || target?.hasAttribute("download")) {
    return;
  }

  // Prevent default for local URLs
  if (isLocalUrl(href)) {
    event.preventDefault();
    navigateTo(href, replace);
  }
}

/**
 * Link component for client-side navigation
 *
 * @example
 * ```tsx
 * <Link href="/about">About</Link>
 * <Link href="/blog/post-1" prefetch scroll={false}>Read More</Link>
 * ```
 */
export function Link({
  href,
  replace = false,
  scroll = true,
  prefetch = true,
  children,
  onClick,
  onMouseEnter,
  onTouchStart,
  ...props
}: LinkProps): VNode {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Set up Intersection Observer for visibility detection
  useEffect(() => {
    if (typeof window === "undefined" || !prefetch) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    if (linkRef.current) {
      observer.observe(linkRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [prefetch]);

  // Prefetch when visible
  useEffect(() => {
    if (isVisible && prefetch && isLocalUrl(href)) {
      prefetchPage(href);
    }
  }, [isVisible, href, prefetch]);

  // Handle mouse enter for prefetch on hover
  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      if (onMouseEnter) {
        onMouseEnter(e);
      }

      if (isLocalUrl(href)) {
        prefetchPage(href);
      }
    },
    [href, onMouseEnter],
  );

  // Handle touch start for prefetch on touch
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (onTouchStart) {
        onTouchStart(e);
      }

      if (isLocalUrl(href)) {
        prefetchPage(href);
      }
    },
    [href, onTouchStart],
  );

  // Handle click
  const handleClick = useCallback(
    (e: MouseEvent) => {
      handleLinkClick(e, href, replace, onClick);
    },
    [href, replace, onClick],
  );

  return (
    <a
      ref={linkRef}
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </a>
  );
}

export default Link;
