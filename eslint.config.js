// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([{
  ignores: [
    '**/dist/**',
    'crates/**/pkg/**',
    'packages/jen/src/core/jen_router.js',
    'packages/jen/src/core/__tests__/**',
    'packages/jen/src/devtools/__tests__/**',
    'packages/jen/src/server/__tests__/**',
    'packages/jen/.vercel/output/**',
    'packages/jen/.vercel/cache/**',
    'packages/jen/src/fonts/__tests__/**',
    'packages/jen/src/client/__tests__/**',
    'packages/jen/src/core/jen_router.cjs',
    '**/**/.jen/**'
  ],
}, // Apply JS Recommended
js.configs.recommended, // Apply TS Recommended
...tseslint.configs.recommended, {
  files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
  languageOptions: {
    globals: { ...globals.browser, ...globals.node },
  },
  // If you need specific rules, add them here
  rules: {
    // "no-console": "warn"
  },
}, ...storybook.configs["flat/recommended"]]);
