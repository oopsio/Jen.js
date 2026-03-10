import { h } from "preact";
/**
 * Link component for client-side routing
 * Compiles to <a data-jen-link> at build time
 * Router auto-intercepts clicks
 */
export function Link({ href, children, ...props }) {
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
