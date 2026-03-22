import type { Plugin } from 'vite';

/**
 * Jen.js Font Optimization Plugin
 * Handles build-time font downloads for production
 */
export function jenFontPlugin(): Plugin {
  return {
    name: 'vite-plugin-jen-font',

    // In production build, we intercept GoogleFont calls to collect URLs
    transform(code, id) {
      if (
        process.env.NODE_ENV === 'production' &&
        (id.endsWith('.tsx') || id.endsWith('.ts'))
      ) {
        // Regex to find GoogleFont("Font Name", { ... })
        // Font collection would happen here in full implementation
        void code.matchAll(/GoogleFont\(['"](.*?)['"](.*?)\)/g);
        // Font collection would happen here in full implementation
      }
      return null;
    },

    async generateBundle() {
      if (process.env.NODE_ENV !== 'production') return;
      // In a real implementation, we'd have collected URLs during transform or SSR
      // and then call downloadFont(url, 'dist/fonts') here.
    },
  };
}
