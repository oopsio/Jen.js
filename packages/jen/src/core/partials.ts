import type { ComponentType } from 'preact';

/**
 * Type map representing the backing registry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const partialRegistry = new Map<string, ComponentType<any>>();

/**
 * Manages the registration and retrieval of Jen.js partials (reusable components).
 */
export const PartialRegistry = {
  /**
   * Registers a single partial explicitly.
   * @param name The unique name to identify the partial.
   * @param component The Preact component to render.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(name: string, component: ComponentType<any>) {
    partialRegistry.set(name, component);
  },

  /**
   * Helper to automatically register multiple partials from Vite's import.meta.glob.
   * Provide the result of import.meta.glob to eagerly load components.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerGlob(globResult: Record<string, any>) {
    for (const [path, module] of Object.entries(globResult)) {
      // Extract the filename without the extension, e.g., '/partials/Card.tsx' -> 'Card'
      const match = path.match(/([^\/]+)\.(?:tsx|ts|jsx|js)$/);
      if (match && module.default) {
        const name = match[1];
        partialRegistry.set(name, module.default); // Keep original casing or enforce lower-case? Keeping original is safer.
      }
    }
  },

  /**
   * Retrieves a partial by its registered name.
   * @param name The name of the registered partial.
   * @returns The Preact component or undefined if not found.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(name: string): ComponentType<any> | undefined {
    return partialRegistry.get(name);
  },

  /**
   * Clears the partials registry (useful for test isolation).
   */
  clear() {
    partialRegistry.clear();
  },
};
