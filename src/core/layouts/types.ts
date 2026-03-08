/**
 * Exported interface that layout modules (TSX/JSX files named (layout)) must conform to.
 * Layout modules define wrapping components that surround page content and can be nested.
 *
 * @example
 * ```typescript
 * import type { LayoutModule } from "jenjs";
 *
 * export const layout = {
 *   navigationItems: [
 *     { label: "Home", href: "/" },
 *     { label: "About", href: "/about" }
 *   ]
 * };
 *
 * export default function RootLayout({ children, data, params }) {
 *   return (
 *     <html>
 *       <head><title>My Site</title></head>
 *       <body>
 *         <nav>{'navigation'}</nav>
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export type LayoutModule = {
  /**
   * Optional configuration object for the layout.
   * Can contain metadata, navigation items, styling info, or any other data
   * that child layouts or pages might inherit or override.
   *
   * Child layouts inherit parent configuration unless they explicitly override it.
   * Configuration is merged (shallow merge) when child defines same keys.
   */
  layout?: Record<string, any>;

  /**
   * Optional Head component for injecting head elements (title, meta, links).
   * If defined, renders into the <head> section.
   * Receives props: { data, params, query }
   *
   * Head components from nested layouts are composed together,
   * with child Head components appended after parent Head components.
   *
   * @example
   * ```typescript
   * export function Head({ params }) {
   *   return <meta name="description" content="My Layout" />;
   * }
   * ```
   */
  Head?: (props: any) => any;

  /**
   * Required default export: the layout wrapper component.
   * Receives { children, data, params, query } as props.
   * The 'children' prop contains the rendered child layout/page component.
   *
   * Layout components are composed from root to leaf:
   * RootLayout > BlogLayout > PageContent
   *
   * @example
   * ```typescript
   * export default function Layout({ children, data, params }) {
   *   return (
   *     <div class="layout">
   *       <header>Header</header>
   *       <main>{children}</main>
   *       <footer>Footer</footer>
   *     </div>
   *   );
   * }
   * ```
   */
  default: (props: any) => any;
};

/**
 * Resolved layout hierarchy for a specific route.
 * Contains all applicable layouts in rendering order (root to leaf).
 */
export type ResolvedLayoutStack = {
  /**
   * Array of loaded layout modules in order from root to deepest.
   * Each entry is the imported LayoutModule.
   */
  modules: LayoutModule[];

  /**
   * Merged configuration from all layouts in the stack.
   * Child layout configurations override parent configurations (shallow merge).
   * Useful for passing data through the layout hierarchy.
   */
  config: Record<string, any>;
};
