import { ComponentChildren, h } from "preact";

export interface LinkProps {
  href: string;
  children: ComponentChildren;
  class?: string;
  [key: string]: any;
}

/**
 * Link component for client-side routing
 * Compiles to <a data-jen-link> at build time
 * Router auto-intercepts clicks
 */
export function Link({ href, children, ...props }: LinkProps) {
  return h(
    "a",
    {
      href,
      "data-jen-link": true,
      ...props,
    },
    children,
  );
}
