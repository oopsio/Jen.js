import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      'crates/**/pkg/**',
      'packages/jen/src/core/jen_router.js',
    ],
  },
  // Apply JS Recommended
  js.configs.recommended,
  // Apply TS Recommended
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    // If you need specific rules, add them here
    rules: {
      // "no-console": "warn"
    },
  },
]);
