import { h } from "preact";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { join } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import {
  vueEsbuildPlugin,
  svelteEsbuildPlugin,
} from "../../compilers/esbuild-plugins.js";
/**
 * Resolves the cache directory path for compiled layout modules.
 * Similar to route module caching to avoid repeated compilation.
 *
 * @param filePath The absolute path to the original layout file
 * @returns The absolute path to the cached compiled output file
 */
function getCachePath(filePath) {
  const cacheDir = join(process.cwd(), "node_modules", ".jen", "cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  const flatName = filePath.replace(/[\\/:]/g, "_").replace(/^_+/, "");
  return join(cacheDir, flatName + ".layout.mjs");
}
/**
 * Loads and compiles a layout module from file.
 * Handles TypeScript/JSX/Vue/Svelte transpilation.
 *
 * @param filePath The absolute path to the layout file
 * @returns The imported LayoutModule
 * @throws Error if compilation or import fails
 */
async function loadLayoutModule(filePath) {
  let moduleUrl = filePath;
  const ext = filePath.slice(-4).toLowerCase();
  const requiresTranspile = [".tsx", ".ts", ".vue", ".svelte"].some((e) =>
    filePath.toLowerCase().endsWith(e),
  );
  if (requiresTranspile) {
    const outfile = getCachePath(filePath);
    await esbuild.build({
      entryPoints: [filePath],
      outfile,
      format: "esm",
      platform: "node",
      target: "es2022",
      bundle: true,
      external: ["preact", "preact-render-to-string", "jenjs"],
      write: true,
      plugins: [vueEsbuildPlugin(), svelteEsbuildPlugin()],
    });
    moduleUrl = outfile;
  }
  let mod;
  try {
    mod = await import(pathToFileURL(moduleUrl).href + "?t=" + Date.now());
  } catch (err) {
    throw new Error(
      `Failed to import layout module ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  // Validate that default export exists
  if (!mod.default) {
    throw new Error(
      `Layout module ${filePath} does not export a default component`,
    );
  }
  return mod;
}
/**
 * Resolves the complete layout stack for a route.
 * Loads all applicable layouts, merges their configuration, and prepares them for rendering.
 *
 * Configuration is merged from root to leaf, with child configurations overriding parent values.
 *
 * @param layoutEntries All layout entries applicable to this route (from buildLayoutHierarchy)
 * @returns Resolved layout stack with modules and merged configuration
 * @throws Error if any layout file fails to load
 */
export async function resolveLayoutStack(layoutEntries) {
  const modules = [];
  let mergedConfig = {};
  // Load and process layouts in order (root to leaf)
  for (const entry of layoutEntries) {
    const mod = await loadLayoutModule(entry.filePath);
    modules.push(mod);
    // Merge configuration (child overrides parent)
    if (mod.layout) {
      mergedConfig = {
        ...mergedConfig,
        ...mod.layout,
      };
    }
  }
  return {
    modules,
    config: mergedConfig,
  };
}
/**
 * Renders a component wrapped in a layout hierarchy.
 * Composes all layouts from root to leaf, passing the child content down the tree.
 *
 * The composition works as:
 * RootLayout wraps (BlogLayout wraps (PageLayout wraps (PageComponent)))
 *
 * Each layout receives:
 * - children: The rendered output from the child layout or page component
 * - data: Data passed from page loader
 * - params: URL parameters
 * - query: Query string parameters
 *
 * @param layoutStack The resolved layout stack
 * @param pageComponent The Preact component to render as the deepest child
 * @param props Props to pass through the layout hierarchy (data, params, query)
 * @returns Preact VNode representing the composed layout tree
 */
export function renderWithLayoutStack(layoutStack, pageComponent, props) {
  // Start with the page component as the innermost content
  let content = h(pageComponent, props);
  // Wrap with layouts from deepest to root (reverse order)
  for (let i = layoutStack.modules.length - 1; i >= 0; i--) {
    const layoutMod = layoutStack.modules[i];
    const Layout = layoutMod.default;
    // Pass children and props to each layout
    content = h(Layout, {
      children: content,
      ...props,
    });
  }
  return content;
}
/**
 * Collects all Head components from the layout stack.
 * Head components are rendered in order from root to leaf, allowing layouts
 * to contribute to document head (meta tags, title, links, etc.).
 *
 * @param layoutStack The resolved layout stack
 * @param pageHeadComponent Optional Head component from the page
 * @param props Props to pass to Head components
 * @returns Array of rendered Head VNodes
 */
export function collectLayoutHeads(layoutStack, pageHeadComponent, props) {
  const heads = [];
  // Collect heads from layouts (root to leaf)
  for (const layoutMod of layoutStack.modules) {
    if (layoutMod.Head) {
      const headNode = h(layoutMod.Head, props);
      heads.push(headNode);
    }
  }
  // Page head comes last
  if (pageHeadComponent) {
    const headNode = h(pageHeadComponent, props);
    heads.push(headNode);
  }
  return heads;
}
